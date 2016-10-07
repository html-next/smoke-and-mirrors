/* global Array, parseFloat, Math */
import Ember from 'ember';
import layout from './template';
import getTagDescendant from '../../utils/get-tag-descendant';
import ListRadar from '../../-private/radar/models/list-radar';
import identity from '../../-private/ember/utils/identity';
import scheduler from '../../-private/scheduler';

const {
  A,
  K,
  get,
  computed,
  Component
} = Ember;

function valueForIndex(arr, index) {
  return arr.objectAt ? arr.objectAt(index) : arr[index];
}

function getContent(obj) {
  return get(obj, 'content');
}

const VerticalCollection = Component.extend({
  /*
   * Defaults to `vertical-collection`.
   *
   * If itemTagName is blank or null, the `vertical-collection` will [tag match](../addon/utils/get-tag-descendant.js)
   * with the `vertical-item`.
   */
  tagName: 'vertical-collection',
  layout,

  content: computed.alias('items'),
  items: undefined,

  // –––––––––––––– Required Settings

  /*
   * This height is used to give the `vertical-item`s height prior to
   * it's content being rendered.
   *
   * This height is replaced with the actual rendered height once content
   * is rendered for the first time.
   */
  defaultHeight: 75,
  alwaysRemeasure: false,
  alwaysUseDefaultHeight: computed.not('alwaysRemeasure'),

  /*
   * Cached value used once default height is
   * calculated firmly
   */
  _defaultHeight: null,

  // –––––––––––––– Optional Settings

  /*
   * Classes to add to the `vertical-item`
   */
  itemClassNames: '',

  // –––––––––––––– Optional Settings
  /*
   * A jQuery selector string that will select the element from
   * which to calculate the viewable height and needed offsets.
   *
   * This element will also have the `scroll` event handler added to it.
   *
   * Usually this element will be the component's immediate parent element,
   * if so, you can leave this null.
   *
   * Set this to "body" to scroll the entire web page.
   */
  containerSelector: null,

  /*
   * Used if you want to explicitly set the tagName of collection's items
   */
  itemTagName: '',
  key: '@identity',

  // –––––––––––––– Performance Tuning
  /*
   * how much extra room to keep visible and invisible on
   * either side of the viewport.
   *
   * This used to be two separate values (invisibleBuffer/visibleBuffer)
   * but these values have been unified to ease a future transition in
   * the internal mechanics of the collection to utilize DOM recycling.
   */
  bufferSize: 0.25,

  // –––––––––––––– Initial State
  /*
   *  If set, this will be used to set
   *  the scroll position at which the
   *  component initially renders.
   */
  scrollPosition: 0,

  /*
   * If set, if scrollPosition is empty
   * at initialization, the component will
   * render starting at the bottom.
   */
  renderFromLast: false,
  __isInitializingFromLast: false,

  /*
   * If set, all items will initially be revealed
   * so that their dimensions can be correctly
   * determined
   */
  renderAllInitially: false,
  _isFirstRender: true,

  /*
   * If set, upon initialization the scroll
   * position will be set such that the item
   * with the provided id is at the top left
   * on screen.
   *
   * If the item cannot be found, scrollTop
   * is set to 0.
   */
  idForFirstItem: null,

  // –––––––––––––– Actions
  /*
   * Specify an action to fire when the last item is reached.
   *
   * This action will only fire once per unique last item, and
   * is fired the moment the last element is visible, it does
   * not need to be on screen yet.
   *
   * It will include the index and content of the last item,
   * as well as a promise.
   *
   * ```
   * {
   *  index: 0,
   *  item : {},
   *  promise: fn
   * }
   * ```
   *
   * The promise should be resolved once any loading is complete, or
   * rejected if loading has failed.
   *
   * If `loadingComponentClass` is defined, it will be inserted above existing content.
   *
   * Rejecting the promise leaves the loadingComponent in place for 5s and set's
   * it's `loadingFailed` property to true.
   *
   */
  firstReached: null,

  /*
   * Specify an action to fire when the first item is reached.
   *
   * This action will only fire once per unique first item, and
   * is fired the moment the first element is visible, it does
   * not need to be on screen yet.
   *
   * It will include the index and content of the first item
   * as well as a promise.
   *
   * ```
   * {
   *  index: 0,
   *  item : {},
   *  promise: fn
   * }
   * ```
   *
   * The promise should be resolved once any loading is complete, or
   * rejected if loading has failed.
   *
   * If `loadingViewClass` is defined, it will be inserted above existing content.
   *
   * Rejecting the promise leaves the loadingView in place for 5s and set's
   * it's `loadingFailed` property to true.
   *
   */
  lastReached: null,

  /*
   * Specify an action to fire when the first on-screen item
   * changes.
   *
   * It includes the index and content of the item now visible.
   */
  firstVisibleChanged: null,

  /*
   * Specify an action to fire when the last on-screen item
   * changes.
   *
   * It includes the index and content of the item now visible.
   */
  lastVisibleChanged: null,

  _content: null,

  // –––––––––––––– Private Internals
  _firstVisibleIndex: 0,

  /*
   * a cached element reference to the container "viewport" element
   * this is known as the "telescope" within the Radar class.
   */
  _container: null,

  /*
   * Set this to false to prevent rendering entirely.
   * Useful for situations in which rendering is
   * expensive enough that it interferes with a
   * transition animation.
   *
   * In such cases, set this to false, and switch it
   * to true once animation has completed.
   */
  shouldRender: true,

  /*
   * forward is true, backwards is false
   */
  _scrollIsForward: 0,
  radar: null,
  _nextUpdate: null,
  _nextSync: null,
  _nextScrollSync: null,
  _isPrepending: false,
  _children: null,

  keyForItem(item, index) {
    let key;
    const keyPath = this.get('key');

    switch (keyPath) {
      case '@index':
        // allow 0 index
        if (!index && index !== 0) {
          throw new Error('No index was supplied to keyForItem');
        }
        key = index;
        break;
      case '@identity':
        key = identity(item);
        break;
      default:
        if (keyPath) {
          key = get(item, keyPath);
        } else {
          key = identity(item);
        }
    }

    if (typeof key === 'number') {
      key = String(key);
    }

    return key;
  },

  // –––––––––––––– Action Helper Functions
  canSendActions(name /* context*/) {
    // don't trigger during a prepend or initial render
    if (this._isFirstRender || this._isPrepending) {
      return false;
    }

    if (name === 'firstReached') {
      if (this._scrollIsForward) {
        return false;
      }
    }

    return !(name === 'lastReached' && !this._scrollIsForward);
  },

  prepareActionContext(name, context) {
    if (name === 'didMountCollection') {
      if (context.firstVisible.item) {
        context.firstVisible.item = getContent(context.firstVisible.item);
      }

      if (context.lastVisible.item) {
        context.lastVisible.item = getContent(context.lastVisible.item);
      }

      return context;
    }

    context.item = getContent(context.item);
    return !context.item ? false : context;
  },

  keyForContext(context) {
    return this.keyForItem(context.item, context.index);
  },

  __smActionCache: null,
  sendActionOnce(name, context) {
    if (!this.canSendActions(name, context)) {
      return;
    }

    context = this.prepareActionContext(name, context);
    if (!context) {
      return;
    }

    const contextCache = this.__smActionCache;

    if (contextCache.hasOwnProperty(name)) {
      const contextKey = this.keyForContext(context);

      if (contextCache[name] === contextKey) {
        return;
      }
      contextCache[name] = contextKey;
    }

    // this MUST be async or glimmer will freak
    scheduler.schedule('affect', () => {
      setTimeout(() => {
        this.sendAction(name, context, K);
      });
    });
  },

  /*
   Binary search for finding the topmost visible view.
   This is not the first visible item on screen, but the first
   item that will render it's content.

   @method _findFirstRenderedComponent
   @param {Number} invisibleTop The top/left of the viewport to search against
   @returns {Number} the index into childViews of the first view to render
   **/
  _findFirstRenderedComponent(visibleTop) {
    const childComponents = this.get('children');
    let maxIndex = childComponents.length - 1;
    let minIndex = 0;
    let midIndex;

    if (maxIndex < 0) {
      return 0;
    }

    while (maxIndex > minIndex) {
      midIndex = Math.floor((minIndex + maxIndex) / 2);

      // in case of not full-window scrolling
      const component = childComponents[midIndex];
      const componentBottom = component.satellite.geography.bottom;

      if (componentBottom > visibleTop) {
        maxIndex = midIndex - 1;
      } else {
        minIndex = midIndex + 1;
      }
    }

    return minIndex;
  },

  children: computed('_children.@each.index', function() {
    const children = this.get('_children');
    const output = new Array(get(children, 'length'));

    children.forEach((item) => {
      const index = get(item, 'index');
      output[index] = item;
    });
    return output;
  }),

  register(child) {
    this.get('_children').addObject(child);
    child.radar = this.radar;
    this._scheduleUpdate();
  },

  unregister(child) {
    const children = this.get('_children');

    if (children) {
      children.removeObject(child);
      if (!this.get('isDestroying') && !this.get('isDestroyed')) {
        this._scheduleUpdate();
      }
    }
  },

  /*
   *
   * The big question is can we render from the bottom
   * without the bottom most item being taken off screen?
   *
   * Triggers on scroll.
   *
   * @private
   */
  _updateChildStates(/* source */) {  // eslint: complexity
    if (!this.get('shouldRender')) {
      return;
    }

    const edges = this._edges;
    const childComponents = this.get('children');

    if (!get(childComponents, 'length')) {
      return;
    }

    if (this._isFirstRender) {
      if (this.get('renderAllInitially')) {
        childComponents.forEach((i) => {
          i.show();
        });

        this._scheduleScrollSync();

        this._isFirstRender = false;
        return;
      }
    }

    const currentViewportBound = this.radar.skyline.top;
    let currentUpperBound = edges.visibleTop;

    if (currentUpperBound < currentViewportBound) {
      currentUpperBound = currentViewportBound;
    }

    const topComponentIndex = this._findFirstRenderedComponent(currentUpperBound);
    let bottomComponentIndex = topComponentIndex;
    const lastIndex = childComponents.length - 1;
    let topVisibleSpotted = false;
    let toCull = [];
    const toShow = [];

    while (bottomComponentIndex <= lastIndex) {
      const component = childComponents[bottomComponentIndex];
      const componentTop = component.satellite.geography.top;
      const componentBottom = component.satellite.geography.bottom;

      // end the loop if we've reached the end of components we care about
      if (componentTop > edges.visibleBottom) {
        break;
      }

      // above the upper reveal boundary
      if (componentBottom < edges.visibleTop) {
        toCull.push(component);

        // above the upper screen boundary
      } else if (componentBottom < edges.viewportTop) {
        toShow.push(component);
        if (bottomComponentIndex === 0) {
          this.sendActionOnce('firstReached', {
            item: component,
            index: bottomComponentIndex
          });
        }

        // above the lower screen boundary
      } else if (componentTop < edges.viewportBottom) {
        toShow.push(component);
        if (bottomComponentIndex === 0) {
          this.sendActionOnce('firstReached', {
            item: component,
            index: bottomComponentIndex
          });
        }
        if (bottomComponentIndex === lastIndex) {
          this.sendActionOnce('lastReached', {
            item: component,
            index: bottomComponentIndex
          });
        }

        if (!topVisibleSpotted) {
          topVisibleSpotted = true;
          this.set('_firstVisibleIndex', bottomComponentIndex);
          this.sendActionOnce('firstVisibleChanged', {
            item: component,
            index: bottomComponentIndex
          });
        }

        // above the lower reveal boundary (componentTop < edges.visibleBottom)
      } else {
        toShow.push(component);
        if (bottomComponentIndex === lastIndex) {
          this.sendActionOnce('lastReached', {
            item: component,
            index: bottomComponentIndex
          });
        }
      }

      bottomComponentIndex++;
    }

    this.sendActionOnce('lastVisibleChanged', {
      item: childComponents[bottomComponentIndex - 1],
      index: bottomComponentIndex - 1
    });

    toCull = toCull
      .concat((childComponents.slice(0, topComponentIndex)))
      .concat(childComponents.slice(bottomComponentIndex));

    for (let j = 0; j < toCull.length; j++) {
      toCull[j].cull();
    }
    for (let k = 0; k < toShow.length; k++) {
      toShow[k].show();
    }

    this._scheduleScrollSync();

    if (this._isFirstRender) {
      this._isFirstRender = false;
      this.sendActionOnce('didMountCollection', {
        firstVisible: { item: childComponents[topComponentIndex], index: topComponentIndex },
        lastVisible: { item: childComponents[bottomComponentIndex - 1], index: bottomComponentIndex - 1 }
      });
    }
  },

  _scheduleUpdate() {
    if (this._isPrepending) {
      return;
    }
    if (this._nextUpdate === null) {
      this._nextUpdate = scheduler.schedule('layout', () => {
        this._updateChildStates();
        this._nextUpdate = null;
      });
    }
  },

  _scheduleSync() {
    if (this._nextSync === null) {
      this._nextSync = scheduler.schedule('sync', () => {
        this.radar.updateSkyline();
        this._nextSync = null;
      });
    }
  },

  _scheduleScrollSync() {
    if (this.get('__isInitializingFromLast')) {
      if (this._nextScrollSync === null) {
        this._nextScrollSync = scheduler.schedule('measure', () => {
          const last = this.element.lastElementChild;

          this.set('__isInitializingFromLast', false);
          if (last) {
            last.scrollIntoView(false);
          }

          this._nextScrollSync = null;
        });
      }
    }
  },

  didInsertElement() {
    this.setupContainer();
    this._computeEdges();
    this._initializeScrollState();
    this._scheduleUpdate();
  },

  // –––––––––––––– Setup/Teardown
  setupContainer() {
    const containerSelector = this.get('containerSelector');
    let container;

    if (containerSelector === 'body') {
      container = window;
    } else {
      const $container = containerSelector ? this.$().closest(containerSelector) : this.$().parent();

      container = $container.get(0);
    }

    this._container = container;
    this.setupHandlers();
  },

  setupHandlers() {
    const container = this._container;
    const onScrollMethod = (dY) => {
      if (this._isPrepending) {
        return;
      }
      this._scrollIsForward = dY > 0;

      this._scheduleUpdate();
    };

    const onResizeMethod = () => {
      this._computeEdges();
    };
    const onRebuildMethod = (dY, dX) => {
      if (this._isPrepending) {
        return;
      }

      this._scrollIsForward = dY > 0;
      this._computeEdges();
      this._scheduleUpdate();
    };

    this.radar.setState({
      telescope: container,
      sky: this.element,
      minimumMovement: Math.floor(this.defaultHeight / 2),
      alwaysRemeasure: this.alwaysRemeasure
    });
    this.radar.didResizeSatellites = onResizeMethod;
    this.radar.didAdjustPosition = onResizeMethod;
    this.radar.didShiftSatellites = onScrollMethod;
    this.radar.didRebuild = onRebuildMethod;
  },

  _initializeScrollState() {
    const idForFirstItem = this.get('idForFirstItem');

    if (this.scrollPosition) {
      this.radar.telescope.scrollTop = this.scrollPosition;
    } else if (this.get('renderFromLast')) {
      const last = this.$().get(0).lastElementChild;

      this.set('__isInitializingFromLast', true);
      if (last) {
        last.scrollIntoView(false);
      }
    } else if (idForFirstItem) {
      const content = this.get('content');
      let firstVisibleIndex;

      for (let i = 0; i < get(content, 'length'); i++) {
        if (idForFirstItem === this.keyForItem(valueForIndex(content, i), i)) {
          firstVisibleIndex = i;
        }
      }
      this.radar.telescope.scrollTop = (firstVisibleIndex || 0) * this.__getEstimatedDefaultHeight();
    }
  },

  /*
   * Remove the event handlers for this instance
   * and teardown any temporarily cached data.
   *
   * if storageKey is set, caches much of it's
   * state in order to quickly reboot to the same
   * scroll position on relaunch.
   */
  willDestroyElement() {
    this._destroyCollection();
  },

  willDestroy() {
    this._super();
    this._destroyCollection();
  },

  _destroyCollection() {
    // cleanup scroll
    if (this.radar) {
      this.radar.destroy();
      this.radar.didResizeSatellites = null;
      this.radar.didAdjustPosition = null;
      this.radar.didShiftSatellites = null;
      this.radar = null;
    }

    this.set('_content', null);
    this.set('_children', null);
    this._container = null;
    this.__smActionCache = null;

    // clean up scheduled tasks
    scheduler.forget(this._nextUpdate);
    scheduler.forget(this._nextSync);
    scheduler.forget(this._nextScrollSync);
  },

  __prependComponents() {
    this._isPrepending = true;
    scheduler.forget(this._nextUpdate);
    this._nextUpdate = scheduler.schedule('sync', () => {
      this.radar.silentNight();
      this._updateChildStates();
      this._isPrepending = false;
      this._nextUpdate = null;
    });
  },

  __getEstimatedDefaultHeight() {
    let _defaultHeight = this.get('_defaultHeight');

    if (_defaultHeight) {
      return _defaultHeight;
    }

    const defaultHeight = `${this.get('defaultHeight')}`;

    if (defaultHeight.indexOf('em') === -1) {
      _defaultHeight = parseInt(defaultHeight, 10);
      this.set('_defaultHeight', _defaultHeight);
      return _defaultHeight;
    }

    let element;

    // use body if rem
    if (defaultHeight.indexOf('rem') !== -1) {
      element = window.document.body;
      _defaultHeight = 1;
    } else {
      element = this.get('element');
      if (!element || !element.parentNode) {
        element = window.document.body;
      } else {
        _defaultHeight = 1;
      }
    }

    const fontSize = window.getComputedStyle(element).getPropertyValue('font-size');

    if (_defaultHeight) {
      _defaultHeight = parseFloat(defaultHeight) * parseFloat(fontSize);
      this.set('_defaultHeight', _defaultHeight);
      return _defaultHeight;
    }

    return parseFloat(defaultHeight) * parseFloat(fontSize);
  },

  /*
   * Calculates pixel boundaries between visible, invisible,
   * and culled content based on the "viewport" height,
   * and the bufferSize.
   *
   * @private
   */
  _edges: null,
  _computeEdges() {
    let edges;

    if (!this.radar || !this.radar.planet) {
      edges = {};
    } else {
      // segment top break points
      this.radar.planet.setState();

      const bufferSize = this.get('bufferSize');
      const rect = this.radar.planet;

      edges = {
        viewportTop: rect.top,
        visibleTop: (-1 * bufferSize * rect.height) + rect.top,
        viewportBottom: rect.bottom,
        visibleBottom: (bufferSize * rect.height) + rect.bottom
      };
    }

    this._edges = edges;
    return edges;
  },

  /*
   * Initialize
   */
  _prepareComponent() {
    this.__smActionCache = {
      firstReached: null,
      lastReached: null,
      firstVisibleChanged: null,
      lastVisibleChanged: null
    };

    const collectionTagName = (this.get('tagName') || '').toLowerCase();
    let itemTagName = this.get('itemTagName');

    if (!itemTagName) {
      if (collectionTagName === 'occlusion-collection') {
        itemTagName = 'occlusion-item';
      } else {
        itemTagName = getTagDescendant(collectionTagName);
      }
    }
    this.set('itemTagName', itemTagName);
    this.radar = new ListRadar({});
  },

  _reflectContentChanges() {
    const content = this.get('_content');

    content.contentArrayDidChange = (items, offset, removeCount, addCount) => {
      if (offset <= this.get('_firstVisibleIndex')) {
        this.__prependComponents();
      } else {
        if (!removeCount || removeCount < addCount) {
          this._scheduleUpdate();
        }
        this._scheduleSync();
      }
    };
  },

  didReceiveAttrs(attrs) {
    this._super(...arguments);

    const oldArray = attrs.oldAttrs && attrs.oldAttrs.content ? attrs.oldAttrs.content.value : false;
    const newArray = attrs.newAttrs && attrs.newAttrs.content ? attrs.newAttrs.content.value : false;

    if (oldArray && newArray && this._changeIsPrepend(oldArray, newArray)) {
      this.__prependComponents();
    } else {
      if (newArray && (!oldArray || get(oldArray, 'length') <= get(newArray, 'length'))) {
        this._scheduleUpdate();
      }

      this._scheduleSync();
    }
  },

  _changeIsPrepend(oldArray, newArray) {
    const lengthDifference = get(newArray, 'length') - get(oldArray, 'length');

    // if either array is empty or the new array is not longer, do not treat as prepend
    if (!get(newArray, 'length') || !get(oldArray, 'length') || lengthDifference <= 0) {
      return false;
    }

    // if the keys at the correct indexes are the same, this is a prepend
    const oldInitialItem = valueForIndex(oldArray, 0);
    const oldInitialKey = this.keyForItem(oldInitialItem, 0);
    const newInitialItem = valueForIndex(newArray, lengthDifference);
    const newInitialKey = this.keyForItem(newInitialItem, lengthDifference);

    return oldInitialKey === newInitialKey;
  },


  init() {
    this._super();

    this._prepareComponent();
    this.set('_children',new A());
  }
});

VerticalCollection.reopenClass({
  positionalParams: ['items']
});

export default VerticalCollection;
