import Ember from "ember";
import getTagDescendant from "../utils/get-tag-descendant";
import nextFrame from "../utils/next-frame";
import Scheduler from "../utils/backburner-ext";

const {
  get: get,
  Component,
  assert,
  on,
  observer,
} = Ember;

const jQuery = Ember.$;

const actionContextCacheKeys = {
  'topReached': '_lastTopSent',
  'bottomReached': '_lastBottomSent',
  'topVisibleChanged': '_lastVisibleTopSent',
  'bottomVisibleChanged': '_lastVisibleBottomSent'
};


function valueForIndex(arr, index) {
  return arr.objectAt ? arr.objectAt(index) : arr[index];
}

export default Component.extend({

  //–––––––––––––– Required Settings

  /**!
   * This height is used to give the `OcclusionItem`s height prior to their content being rendered.
   * This height is replaced with the actual rendered height once content is rendered for the first time.
   *
   * If your content will always have the height specified by `defaultHeight`, you can improve performance
   * by specifying `alwaysUseDefaultHeight: true`.
   */
  defaultHeight: "75px",

  /**!
   * Cached value used once default height is
   * calculated firmly
   */
  _defaultHeight: null,


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
   * Set this if you need to dynamically change the height of the container
   * (useful for viewport resizing on mobile apps when the keyboard is open).
   *
   * Changes to this property's value are observed and trigger new view boundary
   * calculations.
   */
  containerHeight: null,

  /**!
   * Defaults to `div`.
   *
   * If itemTagName is blank or null, the `occlusion-collection` will [tag match](../addon/utils/get-tag-descendant.js)
   * with the `OcclusionItem`.
   */
  tagName: 'occlusion-collection',

  /**!
   * Used if you want to explicitly set the tagName of `OcclusionItem`s
   */
  itemTagName: '',

  /**!
   * The `keyForId` property improves performance when the underlying array is changed but most
   * of the items remain the same.  It is used by the [MagicArrayMixin](./magic-array.md).
   *
   * If `useLocalStorageCache` is true, it is also used to cache the rendered heights of content in the list
   */
  keyForId: null,

  /**!
   * The name of the view to render either above or below the existing content when
   * more items are being loaded.  For more information about how and when this is
   * used, see the `Actions` section below.
   */
  loadingViewClass: null,

  //–––––––––––––– Performance Tuning

  /**!
   * If true, dynamic height calculations are skipped and
   * `defaultHeight` is always used as the height of each
   * `OccludedView`.
   */
  alwaysUseDefaultHeight: false,

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
  visibleBuffer: 0.5,

  /**!
   * how much extra room to keep in DOM but
   * with `visible:false` set.
   */
  invisibleBuffer: 0.5,


  //–––––––––––––– Animations
  /**!
   * For performance reasons, by default the `occlusion-collection` does not add an extra class or
   * attribute to the `OccludedView`'s element when hiding or showing the element.
   *
   * Should you need access to a state for using CSS animations, setting `useHiddenAttr` to true
   * will add the attribute `hidden` to the cloakedView when ever it's content is hidden, cached, or
   * culled.
   */
  //TODO enable this feature.
  useHiddenAttr: false,


  //–––––––––––––– Initial State

  /**!
   *  If set, this will be used to set
   *  the scroll position at which the
   *  component initially renders.
   */
  _scrollPosition: 0,

  /**!
   * If set, if _scrollPosition is empty
   * at initialization, the component will
   * render starting at the bottom.
   */
  startFromBottom: false,
  __isInitializingFromBottom: false,

  /**!
   * If set, upon initialization the scroll
   * position will be set such that the item
   * with the provided key is at the top.
   * If the item cannot be found, scrollTop
   * is set to 0.
   */
  topVisibleKey: null,
  _topVisible: null,
  _topVisibleIndex: 0,

  /**!
   *
   */
  //TODO enable this feature.
  useLocalStorageCache: false,

  //–––––––––––––– Actions

  /**!
   * Specify an action to fire when the bottom is reached.
   *
   * This action will only fire once per unique bottom, and
   * is fired the moment the bottom-most element is visible, it does
   * not need to be on screen yet.
   *
   * It will include the index and content of the item at the bottom,
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
  bottomReached: null,

  /**!
   * Specify an action to fire when the top is reached.
   *
   * This action will only fire once per unique top, and
   * is fired the moment the top-most element is visible, it does
   * not need to be on screen yet.
   *
   * It will include the index and content of the item at the top
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
  topReached: null,

  /**!
   * Specify an action to fire when the top on-screen item
   * changes.
   *
   * It includes the index and content of the item now visible.
   */
  topVisibleChanged: null,

  /**!
   * Specify an action to fire when the bottom on-screen item
   * changes.
   *
   * It includes the index and content of the item now visible.
   */
  bottomVisibleChanged: null,


  //–––––––––––––– Private Internals

  /**!
   * a cached jQuery reference to the container element
   */
  _container: null,

  /**!
   * caches the height of each item in the list
   */
  //TODO enable this feature.
  _heightCache: {},

  /**!
   * Cached reference to the last bottom item used
   * to notify `bottomReached` to prevent resending.
   */
  _lastBottomSent: null,

  /**!
   * Cached reference to the last top item used
   * to notify `topReached` to prevent resending.
   */
  _lastTopSent: null,

  /**!
   * Cached reference to the last visible top item used
   * to notify `topVisibleChanged` to prevent resending.
   */
  _lastVisibleTopSent: null,

  /**!
   * Cached reference to the last visible bottom item used
   * to notify `bottomVisibleChange` to prevent resending.
   */
  _lastVisibleBottomSent: null,

  /**!
   * If true, views are currently being added above the visible portion of
   * the screen and scroll/cycle callbacks should be ignored.
   */
  __isPrepending: false,

  /**!
   * false until the first full setup has completed
   */
  __isInitialized: false,


  //–––––––––––––– Helper Functions
  sendActionOnce: function(name, context) {

    // don't trigger during a prepend
    if (this.get('__isPrepending')) {
      return;
    }

    var key = this.get('keyForId');

    if (actionContextCacheKeys[name]) {
      if (this.get(actionContextCacheKeys[name]) === get(context.item, key)) {
        return;
      } else {
        this.set(actionContextCacheKeys[name], get(context.item, key));
      }
    }

    // this MUST be async or glimmer will freak
    this._taskrunner.schedule('afterRender', this, this.sendAction, name, context);
  },


  /**
   Binary search for finding the topmost view on screen.

   @method findTopView
   @param {Number} viewportTop The top of the viewport to search against
   @returns {Number} the index into childViews of the topmost view
   **/
  _findTopView: function(viewportTop, adj) {

    // adjust viewportTop to prevent the randomized coin toss
    // from not finding a view when the pixels are off by < 1
    viewportTop -= 1;

    var items = this.get('content');
    var maxIndex = get(items, 'length') - 1;
    var minIndex = 0;
    var midIndex;

    if (maxIndex < 0) { return 0; }

    while(maxIndex > minIndex){

      midIndex = Math.floor((minIndex + maxIndex) / 2);

      // in case of not full-window scrolling
      var component = this.childForItem(valueForIndex(items, midIndex));
      var viewBottom = component.$().position().top + component.get('_height') + adj;

      if (viewBottom > viewportTop) {
        maxIndex = midIndex - 1;
      } else {
        minIndex = midIndex + 1;
      }
    }

    return minIndex;
  },

  _children: null,
  childForItem: function(item) {
    var val = get(item, this.get('keyForId'));
    return this.get('_children')[val];
  },
  register: function(child, key) {
    this.get('_children')[key] = child;
  },
  unregister: function(key) {
    this.get('_children')[key] = null; // don't delete, it leads to too much GC
  },

  // on scroll, determine view states
  /**!
   *
   * The big question is can we render from the bottom
   * without the bottom most item being taken off screen?
   *
   * @returns {boolean}
   * @private
   */
  _cycleViews: function () {

    if (this.get('__isPrepending') || !this.get('_hasRendered')) {
      return false;
    }

    var edges = this.get('_edges') || this._calculateEdges();
    var items = this.get('content');

    var currentViewportBound = edges.viewportTop + this.$().position().top;
    var currentUpperBound = edges.invisibleTop;

    if (currentUpperBound < currentViewportBound) {
      currentUpperBound = currentViewportBound;
    }

    var topViewIndex = this._findTopView(currentUpperBound, edges.viewportTop);
    var bottomViewIndex = topViewIndex;
    var lastIndex = get(items, 'length') - 1;
    var topVisibleSpotted = false;

    // views to cull
    var toCull = [];

    // views to hide
    var toHide = [];

    // views to show
    var toShow = [];

    // views on screen
    var toScreen = [];

    // onscreen content
    var onscreen = [];

    while (bottomViewIndex <= lastIndex) {

      var component = this.childForItem(valueForIndex(items, bottomViewIndex));

      var viewTop = component.$().position().top;
      var viewBottom = viewTop + component.get('_height');

      // end the loop if we've reached the end of views we care about
      if (viewTop > edges.invisibleBottom) { break; }

        //above the upper invisible boundary
      if (viewBottom < edges.invisibleTop) {
        toCull.push(component);

        //above the upper reveal boundary
      } else if (viewBottom < edges.visibleTop) {
        toHide.push(component);

        //above the upper screen boundary
      } else if (viewBottom < edges.viewportTop) {
        toShow.push(component);
        if (bottomViewIndex === 0) {
          this.sendActionOnce('topReached', {
            item: component.get('content'),
            index: bottomViewIndex
          });
        }

        //above the lower screen boundary
      } else if(viewTop < edges.viewportBottom) {
        toScreen.push(component);
        onscreen.push(component.get('content'));
        if (bottomViewIndex === 0) {
          this.sendActionOnce('topReached', {
            item: component.get('content'),
            index: bottomViewIndex
          });
        }
        if (bottomViewIndex === lastIndex) {
          this.sendActionOnce('bottomReached', {
            item: component.get('content'),
            index: bottomViewIndex
          });
        }

        if (!topVisibleSpotted) {
          topVisibleSpotted = true;
          this.set('_topVisible', component);
          this.set('_topVisibleIndex', bottomViewIndex);
          this.sendActionOnce('topVisibleChanged', {
            item: component.get('content'),
            index: bottomViewIndex
          });
        }
        this.set('_bottomVisible', component);
        this.sendActionOnce('bottomVisibleChanged', {
          item: component.get('content'),
          index: bottomViewIndex
        });

        //above the lower reveal boundary
      } else if (viewTop < edges.visibleBottom) {
        toShow.push(component);
        if (bottomViewIndex === lastIndex) {
          this.sendActionOnce('bottomReached', {
            item: component.get('content'),
            index: bottomViewIndex
          });
        }

        //above the lower invisible boundary
      } else { // (viewTop <= edges.invisibleBottom) {
        toHide.push(component);
      }

      bottomViewIndex++;
    }

    var self = this;
    toCull = toCull.concat(
      (items.slice(0, topViewIndex)).concat(items.slice(bottomViewIndex)).map(function(item){
        return self.childForItem(item);
      })
    );

    // update view states
    this._taskrunner.schedule('actions', this, function updateViewStates(toCull, toHide, toShow, toScreen) {

      //reveal on screen views
      toScreen.forEach(function (v) { v.show(); });

      //reveal visible views
      toShow.forEach(function (v) { v.show(); });

      // hide views
      toHide.forEach(function (v) { v.hide(); });

      //cull views
      toCull.forEach(function (v) { v.cull(); });

      //set scroll
      if (this.get('__isInitializingFromBottom')) {
        this._taskrunner.schedule('afterRender', this, function () {
          var last = this.$().get(0).lastElementChild;
          this.set('__isInitializingFromBottom', false);
          if (last) {
            last.scrollIntoView(false);
          }
        });
      }


    }, toCull, toHide, toShow, toScreen);

  },



  _scheduleOcclusion: function() {

    // cache the scroll offset, and discard the cycle if
    // movement is within (x) threshold
    var scrollTop = this.get('_container').get(0).scrollTop;
    var _scrollTop = this.get('_scrollPosition');
    var defaultHeight = this.__getEstimatedDefaultHeight();

    if (Math.abs(scrollTop - _scrollTop) >= defaultHeight / 2) {
      this.set('_scrollPosition', scrollTop);
      this._taskrunner.scheduleOnce('actions', this, this._cycleViews);
    }

  },



  //–––––––––––––– Setup/Teardown
  _hasRendered: false,
  shouldRender: true,
  canRender: false,

  setup: observer('shouldRender', 'canRender', function() {

    if (this.get('_hasRendered') || !this.get('shouldRender') || !this.get('canRender')) {
      return;
    }
    this.set('_hasRendered', true);

    var id = this.get('elementId');
    var scrollThrottle = this.get('scrollThrottle');
    var containerSelector = this.get('containerSelector');
    var _container = containerSelector ? jQuery(containerSelector) : this.$().parent();
    this.set('_container', _container);

    // TODO This may need vendor prefix detection
    _container.css({
      '-webkit-transform' : 'translate3d(0,0,0)',
      '-moz-transform'    : 'translate3d(0,0,0)',
      '-ms-transform'     : 'translate3d(0,0,0)',
      '-o-transform'      : 'translate3d(0,0,0)',
      'transform'         : 'translate3d(0,0,0)',
      '-webkit-overflow-scrolling': 'touch',
      'overflow-scrolling': 'touch'
    });

    var onScrollMethod = function onScrollMethod() {
      if (this.get('__isPrepending') || !this.get('__isInitialized')) {
        return false;
      }
      this._taskrunner.throttle(this, this._scheduleOcclusion, scrollThrottle);
    }.bind(this);

    var onResizeMethod = function onResizeMethod() {
      this._taskrunner.debounce(this, this._calculateEdges, scrollThrottle, false);
    }.bind(this);

    _container.bind('scroll.occlusion-culling.' + id, onScrollMethod);
    _container.bind('touchmove.occlusion-culling.' + id, onScrollMethod);
    jQuery(window).bind('resize.occlusion-culling.' + id, onResizeMethod);

    //draw initial boundaries
    this.get('_edges');
    this._initializeScrollState();

  }),

  _allowRendering: on('didInsertElement', function() {
    this.set('canRender', true);
  }),


  _initializeScrollState: function() {

    this.set('__isPrepending', true);

    var scrollPosition = this.get('_scrollPosition');
    var topVisibleKey = this.get('topVisibleKey');
    var key = this.get('keyForId');

    if (scrollPosition) {
      this.get('_container').get(0).scrollTop = scrollPosition;
    } else if (this.get('startFromBottom')) {
      var last = this.$().get(0).lastElementChild;
      this.set('__isInitializingFromBottom', true);
      if (last) {
        last.scrollIntoView(false);
      }
    } else if (topVisibleKey) {
      var content = this.get('content'), topVisibleIndex;

      for (let i = 0; i < content.get('length'); i++) {
        if (topVisibleKey === get(valueForIndex(content, i), key)) {
          topVisibleIndex = i;
        }
      }
      this.get('_container').get(0).scrollTop = (topVisibleIndex || 0) * this.__getEstimatedDefaultHeight();
    }

    this._taskrunner.next(this, function() {
      this.set('__isPrepending', false);
      this.set('__isInitialized', true);
      this._cycleViews();
    });

  },

  /**!
   * Remove the event handlers for this instance
   * and teardown any temporarily cached data.
   *
   * if storageKey is set, caches much of it's
   * state in order to quickly reboot to the same
   * scroll position on relaunch.
   */
  _cleanup: on('willDestroyElement', function() {

    if (!this.get('_hasRendered')){
      return;
    }

    //cleanup scroll
    var id = this.get('elementId');
    var _container = this.get('_container');

    _container.unbind('scroll.occlusion-culling.' + id);
    _container.unbind('touchmove.occlusion-culling.' + id);
    jQuery(window).unbind('resize.occlusion-culling.' + id);

    //cache state
    var storageKey = this.get('storageKey');
    if (storageKey) {

      var keyForId = this.get('keyForId');
      var cacheAttrs = this.getProperties(
        '_scrollPosition',
        '_heights',
        '_topVisible',
        '_bottomVisible',
        '_visibleCount'
      );

      cacheAttrs._topVisible = cacheAttrs._topVisible.get(keyForId);
      cacheAttrs._bottomVisible = cacheAttrs._bottomVisible.get(keyForId);

      localStorage.setItem(storageKey, JSON.stringify(cacheAttrs));
    }

    //clean up scheduled tasks
    this._taskrunner.cancelAll();
    this._taskrunner.destroy();

  }),

  __performViewPrepention: function(addCount) {

    this.set('__isPrepending', true);

    var container = this.get('_container').get(0);
    container.scrollTop += addCount * this.__getEstimatedDefaultHeight();

    this._taskrunner.next(this, function() {
      this.set('__isPrepending', false);

      // ensure that visible views are recalculated following an array length change
      nextFrame(this, this._cycleViews);
    });
  },

  didReceiveAttrs: function(attrs) {
    var oldArray = attrs.oldAttrs && attrs.oldAttrs.content ? attrs.oldAttrs.content.value : false;
    var newArray = attrs.newAttrs && attrs.newAttrs.content ? attrs.newAttrs.content.value : false;
    if (oldArray && newArray && this._changeIsPrepend(oldArray, newArray)) {
      var addCount = get(newArray, 'length') - get(oldArray, 'length');
      this.__performViewPrepention(addCount);
    }
  },

  _changeIsPrepend: function(oldArray, newArray) {

    var lengthDifference = get(newArray, 'length') - get(oldArray, 'length');
    var key = this.get('keyForId');

    // if either array is empty or the new array is not longer, do not treat as prepend
    if (!get(newArray, 'length') || !get(oldArray, 'length') || lengthDifference <= 0) {
      return false;
    }

    // if the keys at the correct indexes are the same, this is a prepend
    var oldInitialItem = oldArray.objectAt ? get(oldArray.objectAt(0), key) : get(oldArray[0], key);
    var newInitialItem = newArray.objectAt ? get(newArray.objectAt(lengthDifference), key) : get(newArray[lengthDifference], key);

    return oldInitialItem === newInitialItem;
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
   * debounces a call to `_cycleViews` afterwards to update what's visible
   *
   * @private
   */
  _edges: null,
  _calculateEdges: observer('containerHeight', function calculateViewStateBoundaries() {

    if (!this.get('__hasInitialized') && this.get('_edges')) {
      return;
    }

    var _container = this.get('_container');
    if (!_container) {
      return;
    }
    var edges = {};

    // segment heights
    var viewportHeight = parseInt(this.get('containerHeight'), 10) || _container.height();
    var _visibleBufferHeight = Math.round(viewportHeight * this.get('visibleBuffer'));
    var _invisibleBufferHeight = Math.round(viewportHeight * this.get('invisibleBuffer'));

    // segment top break points
    edges.viewportTop = _container.position().top;
    edges.visibleTop = edges.viewportTop - _visibleBufferHeight;
    edges.invisibleTop = edges.visibleTop - _invisibleBufferHeight;

    // segment bottom break points
    edges.viewportBottom = edges.viewportTop + viewportHeight;

    edges.visibleBottom = edges.viewportBottom + _visibleBufferHeight;
    edges.invisibleBottom = edges.visibleBottom + _invisibleBufferHeight;

    // ensure that visible views are recalculated following a resize
    this._taskrunner.debounce(this, this._cycleViews, this.get('scrollThrottle'));

    this.set('_edges', edges);
    return edges;

  }),

  /**!
   * Initialize
   */
  _prepareComponent: function() {

    this.set('_children', {});

    var prependFn = this.__performViewPrepention.bind(this);
    this.set('__performViewPrepention', prependFn);

    var collectionTagName = (this.get('tagName') || '').toLowerCase();
    var itemTagName = this.get('itemTagName');

    if (!itemTagName) {
      if (collectionTagName === 'occlusion-collection') {
        itemTagName = 'occlusion-item';
      } else {
        itemTagName = getTagDescendant(collectionTagName);
      }
    }

    this.set('itemTagName', itemTagName);

    assert('You must supply a key for the view', this.get('keyForId'));

    this._taskrunner = Scheduler.create();
  },

  init: function() {
    this._prepareComponent();
    this._super();
  }


});
