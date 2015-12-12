/* global Array, parseFloat, Math */
import Ember from 'ember';
import getTagDescendant from '../utils/get-tag-descendant';
import proxied from '../utils/proxied-array';
import ListRadar from '../models/list-radar';
import identity from '../utils/identity';

const {
  get,
  Mixin,
  computed,
  run
  } = Ember;

function valueForIndex(arr, index) {
  return arr.objectAt ? arr.objectAt(index) : arr[index];
}

function getContent(obj, isProxied) {
  const key = isProxied ? 'content.content' : 'content';

  return get(obj, key);
}

export default Mixin.create({
  // –––––––––––––– Optional Settings
  /*
   * A jQuery selector string that will select the element from
   * which to calculate the viewable width and needed offsets.
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
   * The name of the view to render either before or after the existing content when
   * more items are being loaded.  For more information about how and when this is
   * used, see the `Actions` section below.
   *
   * This feature will be deprecated quickly when named yields become available in
   * Ember.
   */
  loadBeforeComponent: null,
  loadAfterComponent: null,

  /*
   * Used if you want to explicitly set the tagName of collection's items
   */
  itemTagName: '',
  key: '@identity',

  // –––––––––––––– Performance Tuning
  /*
   * Time (in ms) to debounce layout recalculations when
   * resizing the window.
   */
  resizeDebounce: 64,

  /*
   * how much extra room to keep visible and invisible on
   * either side of the viewport.
   *
   * This used to be two separate values (invisibleBuffer/visibleBuffer)
   * but these values have been unified to ease a future transition in
   * the internal mechanics of the collection to utilize DOM recycling.
   */
  bufferSize: 1,

  /*
   * useContentProxy
   */
  useContentProxy: false,

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
   * false until the first full setup has completed
   */
  __isInitialized: false,

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

  shouldRenderList: computed('shouldRender', '__smCanRender', function() {
    const shouldRender = this.get('shouldRender');
    const canRender = this.get('__smCanRender');
    const doRender = shouldRender && canRender;
    const _shouldDidChange = this.get('__shouldRender') !== shouldRender;

    // trigger a cycle
    if (doRender && _shouldDidChange) {
      this._nextUpdate = run.scheduleOnce('actions', this, this._updateChildStates, 'shouldRenderList');
    }

    return doRender;
  }),

  /*
   * Internal boolean used to track whether the component
   * has been inserted into the DOM and DOM related setup
   * has occurred.
   *
   * TODO can we eliminate this?
   *
   * @private
   */
  __smCanRender: false,

  __shouldRender: true,

  /*
   * forward is true, backwards is false
   */
  _scrollIsForward: 0,
  radar: null,
  minimumMovement: 15,
  _nextUpdate: null,
  _nextTeardown: null,
  _nextMaintenance: null,
  _isPrepending: false,
  _children: null,

  keyForItem(item, index) {
    let key;
    let keyPath = this.get('key');

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
      if (this.get('_scrollIsForward')) {
        return false;
      }
    }

    return !(name === 'lastReached' && !this.get('_scrollIsForward'));
  },

  prepareActionContext(name, context) {
    let isProxied = this.get('useContentProxy');

    if (name === 'didMountCollection') {
      context.firstVisible.item = getContent(context.firstVisible.item, isProxied);
      context.lastVisible.item = getContent(context.lastVisible.item, isProxied);
      return context;
    }

    context.item = getContent(context.item, isProxied);
    return !context.item ? false : context;
  },

  keyForContext(context) {
    return this.keyForItem(context.item, context.index);
  },

  __smActionCache: null,
  __smIsLoadingSpaceBefore: false,
  __smIsLoadingSpaceAfter: false,
  sendActionOnce(name, context) {
    if (!this.canSendActions(name, context)) {
      return;
    }

    context = this.prepareActionContext(name, context);
    if (!context) {
      return;
    }

    let contextCache = this.__smActionCache;
    if (contextCache.hasOwnProperty(name)) {
      let contextKey = this.keyForContext(context);
      if (contextCache[name] === contextKey) {
        return;
      }
      contextCache[name] = contextKey;
    }

    const callback = (promise) => {
      if (name === 'firstReached' && this.loadBeforeComponent) {
        this.set('__smIsLoadingBefore', true);
        this.set('__smLoadingBeforePromise', promise);
        promise.finally(() => {
          this.set('__smIsLoadingBefore', false);
          this.set('__smLoadingBeforePromise', null);
        });
      }
      if (name === 'lastReached' && this.loadAfterComponent) {
        this.set('__smIsLoadingAfter', true);
        this.set('__smLoadingAfterPromise', promise);
        promise.finally(() => {
          this.set('__smIsLoadingAfter', false);
          this.set('__smLoadingAfterPromise', null);
        });
      }
    };

    // this MUST be async or glimmer will freak
    run.schedule('afterRender', this, this.sendAction, name, context, callback);
  },

  /*
   Binary search for finding the topmost visible view.
   This is not the first visible item on screen, but the first
   item that will render it's content.

   @method _findFirstRenderedComponent
   @param {Number} invisibleTop The top/left of the viewport to search against
   @returns {Number} the index into childViews of the first view to render
   **/
  _findFirstRenderedComponent(invisibleLeft) {
    let childComponents = this.get('children');
    let maxIndex = childComponents.length - 1;
    let minIndex = 0;
    let midIndex;

    if (maxIndex < 0) {
      return 0;
    }

    while (maxIndex > minIndex) {
      midIndex = Math.floor((minIndex + maxIndex) / 2);

      // in case of not full-window scrolling
      let component = childComponents[midIndex];
      let componentRight = component.satellite.geography.right;

      if (componentRight > invisibleLeft) {
        maxIndex = midIndex - 1;
      } else {
        minIndex = midIndex + 1;
      }
    }

    return minIndex;
  },

  children: computed('_children.@each.index', function() {
    let children = this.get('_children');
    let output = new Array(get(children, 'length'));
    children.forEach((item) => {
      let index = get(item, 'index');
      output[index] = item;
    });
    return output;
  }),

  register(child) {
    this.get('_children').addObject(child);
    child.radar = this.radar;
    if (this.__isInitialized) {
      this.__smScheduleUpdate('register');
    }
  },

  unregister(child) {
    let children = this.get('_children');
    if (children) {
      children.removeObject(child);
      if (this.__isInitialized && !this.get('isDestroying') && !this.get('isDestroyed')) {
        this.__smScheduleUpdate('unregister');
      }
    }
  },

  __smSpacerBeforeWidth: 0,
  __smSpacerAfterWidth: 0,

  _removeComponents(toCull, toHide) {
    toCull.forEach((v) => {
      v.cull();
    });
    toHide.forEach((v) => {
      v.hide();
    });
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
    if (!this.get('shouldRenderList')) {
      return;
    }

    let edges = this.get('_edges');
    let childComponents = this.get('children');

    if (this._isFirstRender) {
      if (this.get('renderAllInitially')) {
        childComponents.forEach((i) => {
          i.show();
        });

        // set scroll
        if (this.get('__isInitializingFromLast')) {
          this._nextMaintenance = run.schedule('afterRender', this, function() {
            let last = this.$().get(0).lastElementChild;
            this.set('__isInitializingFromLast', false);
            if (last) {
              last.scrollIntoView(false);
            }
          });
        }

        this._isFirstRender = false;
        return;
      }

    }

    let currentViewportBound = this.radar.skyline.left;
    let currentLeftBound = edges.invisibleLeft;

    if (currentLeftBound < currentViewportBound) {
      currentLeftBound = currentViewportBound;
    }

    let leftComponentIndex = this._findFirstRenderedComponent(currentLeftBound);
    let rightComponentIndex = leftComponentIndex;
    let lastIndex = childComponents.length - 1;
    let leftVisibleSpotted = false;
    let toCull = [];
    let toHide = [];
    let toShow = [];

    while (rightComponentIndex <= lastIndex) {

      let component = childComponents[rightComponentIndex];

      let componentLeft = component.satellite.geography.left;
      let componentRight = component.satellite.geography.right;

      // end the loop if we've reached the end of components we care about
      if (componentLeft > edges.invisibleRight) {
        break;
      }

      // above the upper invisible boundary
      if (componentRight < edges.invisibleLeft) {
        toCull.push(component);

        // above the upper reveal boundary
      } else if (componentRight < edges.visibleLeft) {
        toHide.push(component);

        // above the upper screen boundary
      } else if (componentRight < edges.viewportLeft) {
        toShow.push(component);
        if (rightComponentIndex === 0) {
          this.sendActionOnce('firstReached', {
            item: component,
            index: rightComponentIndex
          });
        }

        // above the lower screen boundary
      } else if (componentLeft < edges.viewportRight) {
        toShow.push(component);
        if (rightComponentIndex === 0) {
          this.sendActionOnce('firstReached', {
            item: component,
            index: rightComponentIndex
          });
        }
        if (rightComponentIndex === lastIndex) {
          this.sendActionOnce('lastReached', {
            item: component,
            index: rightComponentIndex
          });
        }

        if (!leftVisibleSpotted) {
          leftVisibleSpotted = true;
          this.set('_firstVisibleIndex', rightComponentIndex);
          this.sendActionOnce('firstVisibleChanged', {
            item: component,
            index: rightComponentIndex
          });
        }
        this.sendActionOnce('lastVisibleChanged', {
          item: component,
          index: rightComponentIndex
        });

        // above the lower reveal boundary
      } else if (componentLeft < edges.visibleRight) {
        toShow.push(component);
        if (rightComponentIndex === lastIndex) {
          this.sendActionOnce('lastReached', {
            item: component,
            index: rightComponentIndex
          });
        }

        // above the lower invisible boundary
      } else { // (componentTop <= edges.invisibleBottom) {
        toHide.push(component);
      }

      rightComponentIndex++;
    }

    toCull = toCull
      .concat((childComponents.slice(0, leftComponentIndex)))
      .concat(childComponents.slice(rightComponentIndex));

    toCull.forEach((i) => {
      i.cull();
    });
    toHide.forEach((i) => {
      i.hide();
    });
    toShow.forEach((i) => {
      i.show();
    });

    // set scroll
    if (this.get('__isInitializingFromLast')) {
      this._nextMaintenance = run.schedule('afterRender', this, function() {
        let last = this.$().get(0).lastElementChild;
        this.set('__isInitializingFromLast', false);
        if (last) {
          last.scrollIntoView(false);
        }
      });
    }

    if (this._isFirstRender) {
      this._isFirstRender = false;
      this.sendActionOnce('didMountCollection', {
        firstVisible: { item: childComponents[leftComponentIndex], index: leftComponentIndex },
        lastVisible: { item: childComponents[rightComponentIndex - 1], index: rightComponentIndex - 1 }
      });
    }
  },

  __smScheduleUpdate(source) {
    if (this._isPrepending) {
      return;
    }
    this._nextUpdate = run.scheduleOnce('actions', this, this._updateChildStates, source);
  },

  didInsertElement() {
    this._super();
    this._nextMaintenance = run.next(() => {
      this.setupContainer();
      this.set('__smCanRender', true);
      // draw initial boundaries
      this._initializeScrollState();
      this.notifyPropertyChange('_edges');
    });
  },

  // –––––––––––––– Setup/Teardown
  setupContainer() {
    let containerSelector = this.get('containerSelector');

    let container;
    if (containerSelector === 'body') {
      container = window;
    } else {
      let $container = containerSelector ? this.$().closest(containerSelector) : this.$().parent();
      container = $container.get(0);

      $container.css({
        '-webkit-overflow-scrolling': 'touch',
        'overflow-scrolling': 'touch',
        'overflow-x': 'scroll'
      });

    }

    this._container = container;
    this.setupHandlers();
  },

  setupHandlers() {
    let container = this._container;
    let onScrollMethod = (dY) => {
      if (!this.__isInitialized || this._isPrepending) {
        return;
      }
      this.set('_scrollIsForward', dY > 0);
      this.__smScheduleUpdate('scroll');
    };

    let onResizeMethod = () => {
      this.notifyPropertyChange('_edges');
    };

    this.radar.setState({
      telescope: this._container,
      resizeDebounce: this.resizeDebounce,
      sky: container === window ? document.body : this.element,
      minimumMovement: this.minimumMovement
    });
    this.radar.didResizeSatellites = onResizeMethod;
    this.radar.didUpdatePosition = onResizeMethod;
    this.radar.didShiftSatellites = onScrollMethod;
  },

  _initializeScrollState() {
    const idForFirstItem = this.get('idForFirstItem');

    if (this.scrollPosition) {
      this.radar.scrollContainer.scrollLeft = this.scrollPosition;
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
      this.radar.scrollContainer.scrollLeft = (firstVisibleIndex || 0) * this.__getEstimatedDefaultWidth();
    }

    this._nextMaintenance = run.next(this, () => {
      this.__isInitialized = true;
      this._updateChildStates('initializeScrollState');
    });

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
      this.radar.didUpdatePosition = null;
      this.radar.didShiftSatellites = null;
      this.radar = null;
    }

    this.set('_content', null);
    this.set('_children', null);
    this._container = null;
    this.__smActionCache = null;

    // clean up scheduled tasks
    run.cancel(this._nextUpdate);
    run.cancel(this._nextTeardown);
    run.cancel(this._nextMaintenance);
  },

  __prependComponents() {
    if (this.get('__smCanRender')) {
      this._isPrepending = true;
      run.cancel(this._nextUpdate);
      this._nextUpdate = run.scheduleOnce('actions', this, function() {
        this.radar.silentNight();
        this._updateChildStates('prepend');
        this._isPrepending = false;
      });
    }
  },

  __getEstimatedDefaultWidth() {
    let _defaultWidth = this.get('_defaultWidth');

    if (_defaultWidth) {
      return _defaultWidth;
    }

    let defaultWidth = `${this.get('defaultWidth')}`;

    if (defaultWidth.indexOf('em') === -1) {
      _defaultWidth = parseInt(defaultWidth, 10);
      this.set('_defaultWidth', _defaultWidth);
      return _defaultWidth;
    }

    let element;

    // use body if rem
    if (defaultWidth.indexOf('rem') !== -1) {
      element = window.document.body;
      _defaultWidth = 1;
    } else {
      element = this.get('element');
      if (!element || !element.parentNode) {
        element = window.document.body;
      } else {
        _defaultWidth = 1;
      }
    }

    const fontSize = window.getComputedStyle(element).getPropertyValue('font-size');

    if (_defaultWidth) {
      _defaultWidth = parseFloat(defaultWidth) * parseFloat(fontSize);
      this.set('_defaultWidth', _defaultWidth);
      return _defaultWidth;
    }

    return parseFloat(defaultWidth) * parseFloat(fontSize);
  },

  /*
   * Calculates pixel boundaries between visible, invisible,
   * and culled content based on the "viewport" height,
   * and the bufferSize.
   *
   * computes off of `containerSize` although `containerSize`
   * is never used.  This allows you to force it to recompute
   * when needed from the outside.
   *
   * @private
   */
  _edges: computed('containerSize', function() {
    if (!this.radar || !this.radar.planet) {
      return {};
    }

    // segment top break points
    this.radar.planet.setState();

    let bufferSize = this.get('bufferSize');
    let rect = this.radar.planet;
    return {
      viewportLeft: rect.left,
      visibleLeft: (-1 * bufferSize * rect.width) + rect.left,
      invisibleLeft: (-2 * bufferSize * rect.width) + rect.left,
      viewportRight: rect.right,
      visibleRight: (bufferSize * rect.width) + rect.right,
      invisibleRight: (2 * bufferSize * rect.width) + rect.right
    };
  }),

  /*
   * Initialize
   */
  _prepareComponent() {
    this.set('__shouldRender', this.get('shouldRender'));

    this.__smActionCache = {
      firstReached: null,
      lastReached: null,
      firstVisibleChanged: null,
      lastVisibleChanged: null
    };

    let collectionTagName = (this.get('tagName') || '').toLowerCase();
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
    let content = this.get('_content');
    content.contentArrayDidChange = (items, offset /* removeCount, addCount*/) => {
      if (offset <= this.get('_firstVisibleIndex')) {
        this.__prependComponents();
      } else {
        this.__smScheduleUpdate('reflect changes');
        run.scheduleOnce('sync', this.radar, this.radar.updateSkyline);
      }
    };
  },

  _didReceiveAttrs(attrs) {
    let oldArray = attrs.oldAttrs && attrs.oldAttrs.content ? attrs.oldAttrs.content.value : false;
    let newArray = attrs.newAttrs && attrs.newAttrs.content ? attrs.newAttrs.content.value : false;
    if (oldArray && newArray && this._changeIsPrepend(oldArray, newArray)) {
      this.__prependComponents();
    } else {
      this.__smScheduleUpdate('didReveiveAttrs');
      run.scheduleOnce('sync', this.radar, this.radar.updateSkyline);
    }
  },

  _changeIsPrepend(oldArray, newArray) {
    let lengthDifference = get(newArray, 'length') - get(oldArray, 'length');

    // if either array is empty or the new array is not longer, do not treat as prepend
    if (!get(newArray, 'length') || !get(oldArray, 'length') || lengthDifference <= 0) {
      return false;
    }

    // if the keys at the correct indexes are the same, this is a prepend
    let oldInitialItem = valueForIndex(oldArray, 0);
    let oldInitialKey = this.keyForItem(oldInitialItem, 0);
    let newInitialItem = valueForIndex(newArray, lengthDifference);
    let newInitialKey = this.keyForItem(newInitialItem, lengthDifference);

    return oldInitialKey === newInitialKey;
  },

  didReceiveAttrs() {},

  init() {
    this._super(...arguments);

    this._prepareComponent();
    this.set('_children', Ember.A());

    if (this.get('useContentProxy')) {
      this.set('_content', proxied.call(this, 'content', this.get('key')));
      this._reflectContentChanges();
    } else {
      this.set('_content', computed.oneWay('content'));
      this.set('didReceiveAttrs', this._didReceiveAttrs);
    }
  }
});
