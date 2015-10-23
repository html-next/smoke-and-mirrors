/*global Array, parseFloat, Math */
import Ember from 'ember';
import getTagDescendant from '../utils/get-tag-descendant';
import Scheduler from '../utils/backburner-ext';
import keyForItem from '../mixins/key-for-item';
import jQuery from 'jquery';
import PositionTracker from '../primitives/position-tracker';
import proxied from '../computed/proxied-array';
import nextFrame from '../utils/next-frame';

let cancelFrame = window.cancelAnimationFrame;

/**
 * Investigations: http://jsfiddle.net/sxqnt/73/
 */
const {
  get: get,
  Mixin,
  computed,
  run,
  } = Ember;

const actionContextCacheKeys = {
  'firstReached':   '_lastFirstSent',
  'lastReached':    '_lastLastSent',
  'firstVisibleChanged':  '_lastVisibleFirstSent',
  'lastVisibleChanged':   '_lastVisibleLastSent'
};

function valueForIndex(arr, index) {
  return arr.objectAt ? arr.objectAt(index) : arr[index];
}

function getContent(obj, isProxied) {
  let key = isProxied? 'content.content' : 'content';
  return get(obj, key);
}

export default Mixin.create(keyForItem, {

  //–––––––––––––– Optional Settings

  /**!
   * A jQuery selector string that will select the element from
   * which to calculate the viewable height and needed offsets.
   *
   * This element will also have `scroll`, and `touchmove`
   * events added to it while the `occlusion-collection` component
   * is `inDOM`.
   *
   * Usually this element will be the component's immediate parent element,
   * if so, you can leave this null.
   *
   * The container height is calculated from this selector once.
   * If you expect height to change, `containerHeight` is observed
   * and triggers new view boundary calculations.
   *
   */
  containerSelector: null,


  /**!
   * The name of the view to render either above or below the existing content when
   * more items are being loaded.  For more information about how and when this is
   * used, see the `Actions` section below.
   *
   * This feature will be deprecated quickly when named yields become available in
   * Ember.
   */
  //TODO implement, also can we do named yield's to make this API better?
  loadingComponentClass: null,


  /**!
   * Used if you want to explicitly set the tagName of collection's items
   */
  itemTagName: '',


  //–––––––––––––– Performance Tuning

  /**!
   * Time (in ms) between attempts at re-rendering during
   * scrolling.  A new render every ~16ms preserves 60fps.
   * Most re-renders with occlusion-culling have clocked well
   * below 1ms.
   *
   * Given that in a given scroll most of the movement stays within the
   * visible area, it doesn't make sense to set the throttle
   * to 16ms my default.
   */
  scrollThrottle: 16,

  /**!
   * how much extra room to keep visible on
   * either side of the visible area
   */
  visibleBuffer: 1,

  /**!
   * how much extra room to keep in DOM but
   * with `visible:false` set.
   */
  invisibleBuffer: 1,

  /**!
   * useContentProxy
   */
  useContentProxy: false,

  //–––––––––––––– Animations
  /**!
   * For performance reasons, by default the `occlusion-collection` does not add an extra class or
   * attribute to the `OccludedView`'s element when hiding or showing the element.
   *
   * Should you need access to a state for using CSS animations, setting `useHiddenAttr` to true
   * will add the attribute `hidden` to the `occluded-item` when ever it's content is hidden, cached, or
   * culled.
   */
  exposeAttributeState: false,


  //–––––––––––––– Initial State

  /**!
   *  If set, this will be used to set
   *  the scroll position at which the
   *  component initially renders.
   */
  scrollPosition: 0,

  /**!
   * If set, if scrollPosition is empty
   * at initialization, the component will
   * render starting at the bottom.
   */
  renderFromLast: false,
  __isInitializingFromLast: false,

  /**!
   * If set, all items will initially be revealed
   * so that their dimensions can be correctly
   * determined
   */
  renderAllInitially: false,
  _isFirstRender: true,

  /**!
   *
   */
  //TODO enable this feature.
  useLocalStorageCache: false,


  //–––––––––––––– Initial State

  /**!
   * If set, upon initialization the scroll
   * position will be set such that the item
   * with the provided id is at the top left
   * on screen.
   *
   * If the item cannot be found, scrollTop
   * is set to 0.
   */
  idForFirstItem: null,



  //–––––––––––––– Actions
  key: '@identity',

  /**!
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
  //TODO this feature needs the `Promise` portion done.
  firstReached: null,

  /**!
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
  //TODO this feature needs the `Promise` portion done.
  lastReached: null,

  /**!
   * Specify an action to fire when the first on-screen item
   * changes.
   *
   * It includes the index and content of the item now visible.
   */
  firstVisibleChanged: null,

  /**!
   * Specify an action to fire when the last on-screen item
   * changes.
   *
   * It includes the index and content of the item now visible.
   */
  lastVisibleChanged: null,

  _content: null,

  //–––––––––––––– Private Internals
  _firstVisible: null,
  _firstVisibleIndex: 0,

  /**!
   * a cached jQuery and element reference to the container element
   */
  _$container: null,
  _container: null,

  /**!
   * caches the height or width of each item in the list
   */
  //TODO enable this feature.
  __dimensions: null, // TODO since this is a mixin this object {} needs initialized

  /**!
   * Cached reference to the last bottom item used
   * to notify `lastReached` to prevent resending.
   */
  _lastLastSent: null,

  /**!
   * Cached reference to the last top item used
   * to notify `firstReached` to prevent resending.
   */
  _lastFirstSent: null,

  /**!
   * Cached reference to the last visible top item used
   * to notify `firstVisibleChanged` to prevent resending.
   */
  _lastVisibleFirstSent: null,

  /**!
   * Cached reference to the last visible bottom item used
   * to notify `lastVisibleChange` to prevent resending.
   */
  _lastVisibleLastSent: null,

  /**!
   * false until the first full setup has completed
   */
  __isInitialized: false,

  /**!
   * Set this to false to prevent addition of styles which
   * cause GPU acceleration of the list.  GPU accleration
   * is recommended, especially on mobile, unless you are
   * doing your own acceleration styles.  GPU accleration
   * causes bugs with fixed position content, making it
   * behave as absolutely positioned content.
   */
  shouldGPUAccelerate: true,

  /**!
   * Set this to false to prevent rendering entirely.
   * Useful for situations in which rendering is
   * expensive enough that it interferes with a
   * transition animation.
   *
   * In such cases, set this to false, and switch it
   * to true once animation has completed.
   */
  shouldRender: true,

  /**!
   * Internal boolean used to track whether the component
   * has been inserted into the DOM and DOM related setup
   * has occurred.
   *
   * TODO can we eliminate this?
   *
   * @private
   */
  _sm_canRender: false,

  __shouldRender: true,
  shouldRenderList: computed('shouldRender', '_sm_canRender', function() {
    let shouldRender = this.get('shouldRender');
    let canRender = this.get('_sm_canRender');
    let doRender = shouldRender && canRender;
    let _shouldDidChange = this.get('__shouldRender') !== shouldRender;

    // trigger a cycle
    if (doRender && _shouldDidChange) {
      this._taskrunner.next(this, this._updateChildStates, 'shouldRenderList');
    }

    return doRender;
  }),

  //–––––––––––––– Helper Functions
  sendActionOnce(name, context) {
    // don't trigger during a prepend or initial render
    if (this._isFirstRender || this._isPrepending) {
      return;
    }

    if (name === 'firstReached') {
      if (this.get('_scrollIsForward')) {
        return;
      }
    }

    if (name === 'lastReached' && !this.get('_scrollIsForward')) {
      return;
    }


    let isProxied = this.get('useContentProxy');
    context.item = getContent(context.item, isProxied);

    if (!context.item) {
      return;
    }

    if (actionContextCacheKeys[name]) {
      if (this.get(actionContextCacheKeys[name]) === this.keyForItem(context.item, context.index)) {
        return;
      } else {
        this.set(actionContextCacheKeys[name], this.keyForItem(context.item, context.index));
      }
    }

    // this MUST be async or glimmer will freak
    this._taskrunner.schedule('afterRender', this, this.sendAction, name, context);
  },

  /**
   Binary search for finding the topmost visible view.
   This is not the first visible item on screen, but the first
   item that will render it's content.

   @method _findFirstRenderedComponent
   @param {Number} viewportStart The top/left of the viewport to search against
   @Param {Number} height adjustment TODO wtf is this
   @returns {Number} the index into childViews of the first view to render
   **/
  _findFirstRenderedComponent(viewportStart, adj) {
    // adjust viewportStart to prevent the randomized coin toss
    // from not finding a view when the pixels are off by < 1
    viewportStart -= 1;

    let childComponents = this.get('children');
    let maxIndex = childComponents.length - 1;
    let minIndex = 0;
    let midIndex;

    if (maxIndex < 0) { return 0; }

    while(maxIndex > minIndex){
      midIndex = Math.floor((minIndex + maxIndex) / 2);

      // in case of not full-window scrolling
      let component = childComponents[midIndex];
      let componentBottom = component._position.rect.bottom + adj;

      if (componentBottom > viewportStart) {
        maxIndex = midIndex - 1;
      } else {
        minIndex = midIndex + 1;
      }
    }

    return minIndex;
  },

  _children: null,

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
    if (this.__isInitialized) {
      this._sm_scheduleUpdate('register');
    }
  },
  unregister(child) {
    this.get('_children').removeObject(child);
    if (this.__isInitialized) {
      this._sm_scheduleUpdate('unregister');
    }
  },

  _removeComponents(toCull, toHide) {
    toCull.forEach((v) => { v.cull(); });
    toHide.forEach((v) => { v.hide(); });
  },

  /**!
   *
   * The big question is can we render from the bottom
   * without the bottom most item being taken off screen?
   *
   * Triggers on scroll.
   *
   * @private
   */
  _updateChildStates(/*source*/) {
    if (!this.get('shouldRenderList')) {
      return;
    }
    this._positionTracker.scroll();

    let edges = this.get('_edges');
    let childComponents = this.get('children');

    if (this._isFirstRender) {
      if (this.get('renderAllInitially')) {
        childComponents.forEach((i) => { i.show(); });

        //set scroll
        if (this.get('__isInitializingFromLast')) {
          this._taskrunner.schedule('afterRender', this, function() {
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

    let currentViewportBound = edges.viewportTop + this._positionTracker.scrollableRect.top;
    let currentUpperBound = edges.invisibleTop;

    if (currentUpperBound < currentViewportBound) {
      currentUpperBound = currentViewportBound;
    }

    let topComponentIndex = this._findFirstRenderedComponent(currentUpperBound, edges.viewportTop);
    let bottomComponentIndex = topComponentIndex;
    let lastIndex = childComponents.length - 1;
    let topVisibleSpotted = false;
    let toCull = [];
    let toHide = [];
    let toShow = [];

    while (bottomComponentIndex <= lastIndex) {

      let component = childComponents[bottomComponentIndex];

      let componentTop = component._position.rect.top;
      let componentBottom = component._position.rect.bottom;

      // end the loop if we've reached the end of components we care about
      if (componentTop > edges.invisibleBottom) {
        break;
      }

      //above the upper invisible boundary
      if (componentBottom < edges.invisibleTop) {
        toCull.push(component);

        //above the upper reveal boundary
      } else if (componentBottom < edges.visibleTop) {
        toHide.push(component);

        //above the upper screen boundary
      } else if (componentBottom < edges.viewportTop) {
        toShow.push(component);
        if (bottomComponentIndex === 0) {
          this.sendActionOnce('firstReached', {
            item: component,
            index: bottomComponentIndex
          });
        }

        //above the lower screen boundary
      } else if(componentTop < edges.viewportBottom) {
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
          this.set('_firstVisible', component);
          this.set('_firstVisibleIndex', bottomComponentIndex);
          this.sendActionOnce('firstVisibleChanged', {
            item: component,
            index: bottomComponentIndex
          });
        }
        this.set('_lastVisible', component);
        this.sendActionOnce('lastVisibleChanged', {
          item: component,
          index: bottomComponentIndex
        });

        //above the lower reveal boundary
      } else if (componentTop < edges.visibleBottom) {
        toShow.push(component);
        if (bottomComponentIndex === lastIndex) {
          this.sendActionOnce('lastReached', {
            item: component,
            index: bottomComponentIndex
          });
        }

        //above the lower invisible boundary
      } else { // (componentTop <= edges.invisibleBottom) {
        toHide.push(component);
      }

      bottomComponentIndex++;
    }

    toCull = toCull
      .concat((childComponents.slice(0, topComponentIndex)))
      .concat(childComponents.slice(bottomComponentIndex));

    this._taskrunner.debounce(this, this._removeComponents, toCull, toHide, this.get('scrollThrottle') * 6);
    toShow.forEach((i) => { i.show(); });

    //set scroll
    if (this.get('__isInitializingFromLast')) {
      this._taskrunner.schedule('afterRender', this, function() {
        let last = this.$().get(0).lastElementChild;
        this.set('__isInitializingFromLast', false);
        if (last) {
          last.scrollIntoView(false);
        }
      });
    }

    if (this._isFirstRender) {
      this._isFirstRender = false;
    }
  },


  _lastTarget: null,
  scrollTarget: null,


  _nextUpdate: null,
  _sm_scheduleUpdate(source) {
    if (this._isPrepending) {
      return;
    }
    cancelFrame(this._nextUpdate);
    this._nextUpdate = nextFrame(this, this._updateChildStates, source);
  },

  /**
   * forward is true, backwards is false
   */
  _scrollIsForward: 0,
  _minimumMovement: 25,
  _scheduleOcclusion() {
    // cache the scroll offset, and discard the cycle if
    // movement is within (x) threshold
    // TODO make this work horizontally too
    let scrollTop = this._container.scrollTop;
    let _scrollTop = this.scrollPosition;

    if (Math.abs(scrollTop - _scrollTop) >= this._minimumMovement) {
      this.set('_scrollIsForward', scrollTop > _scrollTop);
      this.scrollPosition = scrollTop;
      this._sm_scheduleUpdate('scroll');
    }
  },

  //–––––––––––––– Setup/Teardown
  setupContainer() {
    var scrollThrottle = this.get('scrollThrottle');
    var containerSelector = this.get('containerSelector');
    var $container = containerSelector ? this.$().closest(containerSelector) : this.$().parent();
    this._$container = $container;

    // TODO: The container needs well formed CSS
    // We should probably consider auto adding the following
    // styles:
    // - display: block
    // - height, max-height
    // - position: relative
    $container.css({
      '-webkit-overflow-scrolling': 'touch',
      'overflow-scrolling': 'touch',
      'overflow-y': 'scroll'
    });

    if (this.get('shouldGPUAccelerate')) {
      $container.css({
        '-webkit-transform' : 'translate3d(0,0,0)',
        '-moz-transform'    : 'translate3d(0,0,0)',
        '-ms-transform'     : 'translate3d(0,0,0)',
        '-o-transform'      : 'translate3d(0,0,0)',
        'transform'         : 'translate3d(0,0,0)'
      });
    }

    let onScrollMethod = () => {
      if (!this.__isInitialized || this._isPrepending) { return; }
      this._scheduleOcclusion();
    };

    let onResizeMethod = () => {
      this._taskrunner.debounce(this, this.notifyPropertyChange, '_edges', scrollThrottle);
    };

    let element = $container.get(0);
    this._container = element;
    this._sm_scrollListener = onScrollMethod;
    this._sm_resizeListener = onResizeMethod;
    element.addEventListener('scroll', onScrollMethod, true);
    element.addEventListener('touchmove', onScrollMethod, true);
    element.addEventListener('resize', onResizeMethod, true);
    window.addEventListener('resize', onResizeMethod, true);

    let position = this._positionTracker;
    position.container = element;
    position.scrollable = this.element;
    position.getBoundaries();
  },


  didInsertElement() {
    this._super();
    run.next(() => {
      this.setupContainer();
      this.set('_sm_canRender', true);
      //draw initial boundaries
      this._initializeScrollState();
      this.notifyPropertyChange('_edges');
    });
  },


  _initializeScrollState() {
    var scrollPosition = this.scrollPosition;
    var idForFirstItem = this.get('idForFirstItem');

    if (scrollPosition) {
      this._container.scrollTop = scrollPosition;
    } else if (this.get('renderFromLast')) {
      var last = this.$().get(0).lastElementChild;
      this.set('__isInitializingFromLast', true);
      if (last) {
        last.scrollIntoView(false);
      }
    } else if (idForFirstItem) {
      var content = this.get('content');
      var firstVisibleIndex;

      for (let i = 0; i < get(content, 'length'); i++) {
        if (idForFirstItem === this.keyForItem(valueForIndex(content, i), i)) {
          firstVisibleIndex = i;
        }
      }
      this._container.scrollTop = (firstVisibleIndex || 0) * this.__getEstimatedDefaultHeight();
    }

    this._taskrunner.next(this, () => {
      this.__isInitialized = true;
      this._updateChildStates('initializeScrollState');
    });

  },


  _sm_scrollListener: null,
  _sm_resizeListener: null,
  /**!
   * Remove the event handlers for this instance
   * and teardown any temporarily cached data.
   *
   * if storageKey is set, caches much of it's
   * state in order to quickly reboot to the same
   * scroll position on relaunch.
   */
  willDestroyElement() {
    //cleanup scroll
    let _container = this._container;

    _container.removeEventListener('scroll', this._sm_scrollListener, true);
    _container.removeEventListener('touchmove', this._sm_scrollListener, true);
    _container.removeEventListener('resize', this._sm_resizeListener, true);
    window.removeEventListener('resize', this._sm_resizeListener, true);

    //cache state
    /*
    let storageKey = this.get('storageKey');
    if (storageKey) {

      let cacheAttrs = this.getProperties(
        'scrollPosition',
        '__dimensions',
        '_firstVisible',
        '_lastVisible'
      );

      cacheAttrs._firstVisible = this.keyForItem(cacheAttrs._firstVisible);
      cacheAttrs._lastVisible = this.keyForItem(cacheAttrs._lastVisible);

      localStorage.setItem(storageKey, JSON.stringify(cacheAttrs));
    }
    */

    //clean up scheduled tasks
    this._taskrunner.cancelAll();
    this._taskrunner.destroy();
  },


  _isPrepending: false,
  __prependComponents(addCount) {
    if (this.get('_sm_canRender')) {
      this._isPrepending = true;
      cancelFrame(this._nextUpdate);
      nextFrame(this, function() {
        let container = this._container;
        let heightPerItem = this.__getEstimatedDefaultHeight();
        container.scrollTop += addCount * heightPerItem;
        this.scrollPosition = container.scrollTop;
        this._updateChildStates('prependComponents');
        this._isPrepending = false;
      });
    }
  },


  __getEstimatedDefaultHeight: function() {
    var _defaultHeight = this.get('_defaultHeight');

    if (_defaultHeight) {
      return _defaultHeight;
    }

    var defaultHeight = '' + this.get('defaultHeight');

    if (defaultHeight.indexOf('em') === -1) {
      _defaultHeight = parseInt(defaultHeight, 10);
      this.set('_defaultHeight', _defaultHeight);
      return _defaultHeight;
    }
    var element;

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

    var fontSize = window.getComputedStyle(element).getPropertyValue('font-size');

    if (_defaultHeight) {
      _defaultHeight = parseFloat(defaultHeight) * parseFloat(fontSize);
      this.set('_defaultHeight', _defaultHeight);
      return _defaultHeight;
    }

    return parseFloat(defaultHeight) * parseFloat(fontSize);
  },

  /**!
   * Calculates visible borders / cache level break points
   * based on `containerHeight` or `element.height`.
   *
   * debounces a call to `_updateChildStates` afterwards to update what's visible
   *
   * @private
   */
  __edges: null,
  _edges: computed('containerHeight', 'shouldRenderList', function calculateViewStateBoundaries() {
    if (!this.get('shouldRenderList') && this.get('__edges')) {
      return this.get('__edges');
    }

    let $container = this._$container;
    if (!$container) {
      return;
    }

    var edges = {};
    var containerHeight = this.get('containerHeight');

    // segment heights
    var viewportHeight = parseInt(containerHeight, 10) || $container.height();
    var _visibleBufferHeight = Math.round(viewportHeight * this.get('visibleBuffer'));
    var _invisibleBufferHeight = Math.round(viewportHeight * this.get('invisibleBuffer'));

    // segment top break points
    this._positionTracker.getBoundaries();
    this._positionTracker.resize();
    edges.viewportTop = this._positionTracker.rect.top;
    edges.visibleTop = edges.viewportTop - _visibleBufferHeight;
    edges.invisibleTop = edges.visibleTop - _invisibleBufferHeight;

    // segment bottom break points
    edges.viewportBottom = edges.viewportTop + viewportHeight;

    edges.visibleBottom = edges.viewportBottom + _visibleBufferHeight;
    edges.invisibleBottom = edges.visibleBottom + _invisibleBufferHeight;

    this.set('__edges', edges);

    return edges;
  }),

  _positionTracker: null,

  /**!
   * Initialize
   */
  _prepareComponent() {
    this.set('__shouldRender', this.get('shouldRender'));

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
    this._taskrunner = Scheduler.create({});

    this._positionTracker = PositionTracker.create({});
  },

  _reflectContentChanges() {
    let content = this.get('_content');
    content.contentArrayDidChange = (items, offset, removeCount, addCount) => {
      if (offset <= this.get('_firstVisibleIndex')) {
        this.__prependComponents(addCount);
      } else {
        this._sm_scheduleUpdate('reflect changes');
      }
    };
  },

  _didReceiveAttrs(attrs) {
    let oldArray = attrs.oldAttrs && attrs.oldAttrs.content ? attrs.oldAttrs.content.value : false;
    let newArray = attrs.newAttrs && attrs.newAttrs.content ? attrs.newAttrs.content.value : false;
    if (oldArray && newArray && this._changeIsPrepend(oldArray, newArray)) {
      let addCount = get(newArray, 'length') - get(oldArray, 'length');
      this.__prependComponents(addCount);
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

    let isPrepend = oldInitialKey === newInitialKey;
    return isPrepend;
  },

  didReceiveAttrs() {},

  init() {
    this._super.apply(this, arguments);

    this._prepareComponent();
    this.set('_children', Ember.A());

    if (this.get('useContentProxy')) {
      this.set('_content', proxied.call(this, 'content', this.get('key')));
      this._reflectContentChanges();
    } else {
      this.set('_content', computed.alias('content'));
      this.set('didReceiveAttrs', this._didReceiveAttrs);
    }
  }


});
