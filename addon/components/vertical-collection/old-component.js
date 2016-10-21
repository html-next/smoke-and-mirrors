/* global Array, Math */
import Ember from 'ember';
import layout from './template';
import getTagDescendant from '../../utils/get-tag-descendant';
import Radar from './data-view/mini-radar';
import identity from '../../-private/ember/utils/identity';
import scheduler from '../../-private/scheduler';
import estimateElementHeight from '../../utils/element/estimate-element-height';
import closestElement from '../../utils/element/closest';
import Token from '../../-private/scheduler/token';
import List from './data-view/list';
import ActiveProxy from './data-view/active-proxy';

const {
  A,
  K,
  get,
  set,
  computed,
  Component,
  String: { htmlSafe }
} = Ember;

function getArg(args, name) {
  return (args && args[name]) ? (args[name].value || args[name]) : undefined;
}

const VerticalCollection = Component.extend({
  layout,

  /*
   * Defaults to `vertical-collection`.
   *
   * If itemTagName is blank or null, the `vertical-collection` will [tag match](../addon/utils/get-tag-descendant.js)
   * with the `vertical-item`.
   */
  tagName: 'vertical-collection',
  itemTagName: 'vertical-item',
  itemClassNames: '',
  attributeBindings: ['boxStyle:style'],
  boxStyle: htmlSafe(''),

  key: '@identity',
  content: computed.deprecatingAlias('items'),
  items: null,

  // –––––––––––––– Required Settings

  /*
   * This height is used to give the `vertical-item`s height prior to
   * their content being rendered.
   *
   * This height is replaced with the actual rendered height once content
   * is rendered for the first time.
   */
  defaultHeight: 75,
  alwaysRemeasure: false,
  alwaysUseDefaultHeight: computed.not('alwaysRemeasure'),


  // –––––––––––––– Mandatory Settings
  /*
   * A selector string that will select the element from
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


  // –––––––––––––– Performance Tuning
  /*
   * how much extra room to keep visible and invisible on
   * either side of the viewport.
   */
  bufferSize: 0.25,

  // –––––––––––––– Initial Scroll State
  /*
   *  If set, this will be used to set
   *  the scroll position at which the
   *  component initially renders.
   */
  scrollPosition: 0,

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

  /*
   * If set, if scrollPosition is empty
   * at initialization, the component will
   * render starting at the bottom.
   */
  renderFromLast: false,

  // –––––––––––––– Actions
  /*
   * Specify an action to fire when the first/last item is reached
   * or when the first/last visible item has changed.
   *
   * These action will only fire once per unique item, and
   * they fired the moment the element becomes visible, which
   * may be before it actually enters the viewport.
   *
   * It will include the index and content of the last item.
   *
   * ```
   * {
   *  index: 0,
   *  item : {}
   * }
   * ```
   */
  firstReached: null,
  lastReached: null,
  firstVisibleChanged: null,
  lastVisibleChanged: null,

  // –––––––––––––– @private

  _defaultHeight: computed('defaultHeight', function() {
    let defaultHeight = this.get('defaultHeight');

    if (typeof defaultHeight === 'number') {
      defaultHeight = `${defaultHeight}px`;
    }

    return defaultHeight;
  }),
  defaultItemPixelHeight: computed('defaultHeight', function() {
    return estimateElementHeight(this.element, this.get('defaultHeight'));
  }),

  _isFirstRender: true,
  _isInitializingFromLast: false,
  _firstVisibleIndex: 0,
  _scrollIsForward: 0,
  _isPrepending: false,

  radar: null,
  token: null,
  _tracker: null,
  _edges: null,
  _proxied: null,
  _nextUpdate: null,
  _nextSync: null,
  _nextScrollSync: null,

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
/*
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
*/
/*
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
    this.schedule('affect', () => {
      setTimeout(() => {
        this.sendAction(name, context, K);
      });
    });
  },
*/
  schedule(queueName, job) {
    return scheduler.schedule(queueName, job, this.token);
  },

  _findFirstToRender(visibleTop, scrollIsForward) {
    const { ordered } = this._tracker;
    const { _proxied } = this;

    let first = _proxied[0];
    let position = 0;
    let index = 0;

    if (first) {
      index = first.content.index;
      let bottom = first.content.geography.bottom;
      let isVisible = bottom > visibleTop;
      let isFirst = index === 0;

      if (scrollIsForward) {
        return isVisible ? { position, index } : { position: 1, index: index + 1 };
      }

      if (isFirst) {
        return { position, index };
      }

      let prev = ordered[index - 1];

      return prev.geography.bottom > visibleTop ?
        { position: -1, index: index - 1 } : { position, index };
    }

    return { position, index };
  },

  /*
   Binary search for finding the topmost visible view when restoring
   scroll position.

   This is not the first visible item on screen, but the first
   item that will render it's content.

   @method _findFirstRenderedComponent
   @param {Number} invisibleTop The top/left of the viewport to search against
   @returns {Number} the index into childViews of the first view to render
   **/
  /*
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
  */

  didReceiveAttrs(args) {
    // const oldArray = getArg(args.oldAttrs, 'items');
    const newArray = getArg(args.newAttrs, 'items');

    this._tracker.updateList(newArray);
    this.updateActiveItems(this._tracker.slice());
    this._scheduleUpdate();
    /*
        if (this._tracker.lastUpdateWasPrepend) {
          this._nextUpdate = this.schedule('layout', () => {
            this.radar.silentNight();
            this._updateChildStates();
            this._isPrepending = false;
            this._nextUpdate = null;
          });
        } else {
          this._scheduleSync();
        }

    if (oldArray && newArray && this._changeIsPrepend(oldArray, newArray)) {
      this._isPrepending = true;
      scheduler.forget(this._nextUpdate);

      this._nextUpdate = this.schedule('layout', () => {
        this.radar.silentNight();
        this._updateChildStates();
        this._isPrepending = false;
        this._nextUpdate = null;
      });

    } else {
      if (newArray && (!oldArray || get(oldArray, 'length') <= get(newArray, 'length'))) {
        this._scheduleUpdate();
      }

      this._scheduleSync();
    }
    */
  },

  _scheduleUpdate() {
    if (this._isPrepending) {
      return;
    }
    if (this._nextUpdate === null) {
      this._nextUpdate = this.schedule('layout', () => {
        this._updateChildStates();
        this._nextUpdate = null;
      });
    }
  },

  _scheduleSync() {
    if (this._nextSync === null) {
      this._nextSync = this.schedule('layout', () => {
        this.radar.updateSkyline();
        this._nextSync = null;
      });
    }
  },

  _scheduleScrollSync() {
    if (this.get('__isInitializingFromLast')) {
      if (this._nextScrollSync === null) {
        this._nextScrollSync = this.schedule('measure', () => {
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

  updateActiveItems: function(inbound) {
    const outbound = this._proxied;

    if (!inbound || !inbound.length) {
      outbound.length = 0;
      return outbound;
    }

    for (let i = 0; i < inbound.length; i++) {
      outbound[i] = outbound[i] || new ActiveProxy();
      set(outbound[i], 'content', inbound[i]);
      outbound[i].position = i;
    }
    // this.notifyPropertyChange('length');

    this.set('activeItems', outbound);
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
  _initialRenderCount: 4,
  _updateChildStates() {
    if (this._isFirstRender) {
      console.log(
        'initial render mode',
        window.chunk = window.chunk ? window.chunk++ : 1
      );

      this._initialRenderCount -= 1;
      this._tracker._activeCount += 1;
      this.updateActiveItems(this._tracker.slice());

      let { heightAbove, heightBelow } = this._tracker;

      this.set('boxStyle', htmlSafe(`padding-top: ${heightAbove}px; padding-bottom: ${heightBelow}px;`));

      this.schedule('affect', () => {
        console.log('appending chunk');
        this.radar.rebuild();

        if (this._initialRenderCount === 0) {
          this._isFirstRender = false;
        }

        this._scheduleUpdate();
      });
      return;
    }

    console.log('updating items');
    const edges = this._edges;
    const { ordered } = this._tracker;
    const { _proxied, _scrollIsForward } = this;
    const currentViewportBound = this.radar.skyline.top;
    let currentUpperBound = edges.visibleTop;

    if (currentUpperBound < currentViewportBound) {
      currentUpperBound = currentViewportBound;
    }

    const { position, index: topItemIndex } = this._findFirstToRender(currentUpperBound, _scrollIsForward);
    const lastIndex = ordered.length - 1;
    let bottomItemIndex = topItemIndex;
    let topVisibleSpotted = false;

    while (bottomItemIndex <= lastIndex) {
      const ref = ordered[bottomItemIndex];
      const itemTop = ref.geography.top;
      const itemBottom = ref.geography.bottom;
      console.log('examining', ref, itemTop, itemBottom);

      // end the loop if we've reached the end of components we care about
      if (itemTop > edges.visibleBottom) {
        break;
      }

      // above the upper reveal boundary
      if (itemBottom < edges.visibleTop) {
        bottomItemIndex++;
        continue;
      }

      // above the upper screen boundary
      if (itemBottom < edges.viewportTop) {
        /*
        if (bottomItemIndex === 0) {
          this.sendActionOnce('firstReached', {
            item: component,
            index: bottomItemIndex
          });
        }
        */
        bottomItemIndex++;
        continue;
      }

      // above the lower screen boundary
      if (itemTop < edges.viewportBottom) {
        /*
        if (bottomItemIndex === 0) {
          this.sendActionOnce('firstReached', {
            item: component,
            index: bottomItemIndex
          });
        }
        if (bottomItemIndex === lastIndex) {
          this.sendActionOnce('lastReached', {
            item: component,
            index: bottomItemIndex
          });
        }
        */

        if (!topVisibleSpotted) {
          topVisibleSpotted = true;

          /*
          this.set('_firstVisibleIndex', bottomItemIndex);
          this.sendActionOnce('firstVisibleChanged', {
            item: component,
            index: bottomItemIndex
          });
          */
        }

        bottomItemIndex++;
        continue;
      }

      // above the lower reveal boundary (componentTop < edges.visibleBottom)
        /*
        if (bottomItemIndex === lastIndex) {
          this.sendActionOnce('lastReached', {
            item: component,
            index: bottomItemIndex
          });
        }
        */
      bottomItemIndex++;
    }

    /*
    this.sendActionOnce('lastVisibleChanged', {
      item: ordered[bottomItemIndex - 1],
      index: bottomItemIndex - 1
    });
    */

    // debugger;
    // this._scheduleScrollSync();

    /*
    if (this._isFirstRender) {
      this._isFirstRender = false;
      this.sendActionOnce('didMountCollection', {
        firstVisible: { item: ordered[topItemIndex], index: topItemIndex },
        lastVisible: { item: ordered[bottomItemIndex - 1], index: bottomItemIndex - 1 }
      });
    }
    */

    console.log('top index', topItemIndex);
    console.log('bottom index', bottomItemIndex);

    let len = bottomItemIndex - topItemIndex;
    let curProxyLen = _proxied.length;
    let lenDiff = len - curProxyLen;
    let altered;

    if (lenDiff < 0) {
      let absDiff = -1 * lenDiff;

      if (_scrollIsForward) {
        console.log('removing ' + absDiff + ' active items from use from the top');
        altered = _proxied.splice(0, absDiff);
      } else {
        console.log('removing ' + absDiff + ' active items from use from the bottom');
        altered = _proxied.splice(len, absDiff);
      }
    } else if (lenDiff > 0) {
      console.log('adding ' + lenDiff + ' active items');
      altered = new Array(lenDiff);

      for (let i = 0; i < lenDiff; i++) {
        altered[i] = new ActiveProxy(null, curProxyLen + i);
      }
      if (_scrollIsForward) {
        console.log('adding to bottom');
        _proxied.splice(_proxied.length, 0, altered);
      } else {
        console.log('adding to top');
        _proxied.splice(0, 0, altered);
      }
    }

    if (position < 0) {
      console.log('shifted last to front');
      _proxied.shift(_proxied.pop());
    } else if (position > 0) {
      console.log('shifted front to last');
      _proxied.push(_proxied.unshift());
    }

    let _slice = this._tracker.slice(topItemIndex, len);
    console.log('updating proxy content');
    for (let i = 0; i < len; i++) {
      if (_proxied[i].content !== _slice[i]) {
        console.log(_proxied[i], 'set to', _slice[i]);
        set(_proxied[i], 'content', _slice[i]);
      }
    }

    // _proxied.notifyPropertyChanges();
    this.set('activeItems', _proxied);
    this.notifyPropertyChange('activeItems');
    console.log('active items', _proxied);

    let { heightAbove, heightBelow } = this._tracker;

    this.set('boxStyle', htmlSafe(`padding-top: ${heightAbove}px; padding-bottom: ${heightBelow}px;`));
  },

  /*
  _oldUpdateChildStates() {  // eslint: complexity
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
      ...

    this._scheduleScrollSync();

    if (this._isFirstRender) {
      this._isFirstRender = false;
      this.sendActionOnce('didMountCollection', {
        firstVisible: { item: childComponents[topComponentIndex], index: topComponentIndex },
        lastVisible: { item: childComponents[bottomComponentIndex - 1], index: bottomComponentIndex - 1 }
      });
    }
  },
  */

  // –––––––––––––– Setup/Teardown
  didInsertElement() {
    this.setupRadar();
    this._computeEdges();
    // this._initializeScrollState();
    // this._scheduleUpdate();
    console.timeEnd('vertical-collection-init');
  },

  setupRadar() {
    const containerSelector = this.get('containerSelector');
    let container;

    if (containerSelector === 'body') {
      container = window;
    } else {
      container = containerSelector ? closestElement(containerSelector) : this.element.parentNode;
    }

    const onScrollMethod = (dY) => {
      if (this._isPrepending) {
        console.log('isPrepending');
        return;
      }
      this._scrollIsForward = dY > 0;

      this._scheduleUpdate();
    };

    const onResizeMethod = () => {
      this._computeEdges();
    };

    let radar = this.radar = new Radar(container, this.element);
    radar.minimumMovement = Math.floor(this.get('defaultHeight') / 2);
    radar.didResize = onResizeMethod;
    radar.didScrollOuter = onResizeMethod;
    radar.didScrollInner = onScrollMethod;
  },

  /*
   * Calculates pixel boundaries between visible, invisible,
   * and culled items based on the "viewport" height,
   * and the bufferSize.
   *
   * @private
   */
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
  _initializeScrollState() {
    const idForFirstItem = this.get('idForFirstItem');

    if (this.scrollPosition) {
      this.radar.telescope.scrollTop = this.scrollPosition;
    } else if (this.get('renderFromLast')) {
      const last = this.element.lastElementChild;

      this.set('__isInitializingFromLast', true);
      if (last) {
        last.scrollIntoView(false);
      }
    } else if (idForFirstItem) {
      const items = this.get('items');
      let firstVisibleIndex;

      for (let i = 0; i < get(items, 'length'); i++) {
        if (idForFirstItem === this.keyForItem(valueForIndex(items, i), i)) {
          firstVisibleIndex = i;
        }
      }
      this.radar.telescope.scrollTop = (firstVisibleIndex || 0) * this.get('_defaultHeight');
    }
  },
*/

  _actionCache: computed(function() {
    return {
      firstReached: null,
      lastReached: null,
      firstVisibleChanged: null,
      lastVisibleChanged: null
    };
  }),

  willDestroyElement() {
    // cleanup scroll
    this.token.cancelled = true;
    this.radar.destroy();
    this.radar = null;

    this.set('_children', null);
    this.__smActionCache = null;
  },

  init() {
    console.time('vertical-collection-init');
    this._super();

    if (!this.get('itemTagName')) {
      const collectionTagName = (this.get('tagName') || '').toLowerCase();
      this.set('itemTagName', getTagDescendant(collectionTagName));
    }

    this._tracker = new List(null, this.get('key'), this.get('defaultHeight'));
    this._proxied = new A();
    this.token = new Token();
  }
});

VerticalCollection.reopenClass({
  positionalParams: ['items']
});

export default VerticalCollection;
