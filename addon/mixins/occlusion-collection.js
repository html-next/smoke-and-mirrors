import Ember from 'ember';
import getTagDescendant from '../utils/get-tag-descendant';
import nextFrame from '../utils/next-frame';
import Scheduler from '../utils/backburner-ext';
import jQuery from 'jquery';

/**
 * Investigations: http://jsfiddle.net/sxqnt/73/
 */
const {
  get: get,
  Mixin,
  assert,
  on,
  observer,
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

export default Mixin.create({

  //–––––––––––––– Required Settings
  /**!
   * The `keyForId` property improves performance when the underlying array is changed but most
   * of the items remain the same.  It is used by the [MagicArrayMixin](./magic-array.md) pre-glimmer
   * and by `each` in glimmer.
   *
   * If `useLocalStorageCache` is true, it is also used to cache the rendered heights of content in the list
   */
  keyForId: null,


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
    // TODO this will change based on vertical/horizontal
  containerHeight: null,


  /**!
   * The name of the view to render either above or below the existing content when
   * more items are being loaded.  For more information about how and when this is
   * used, see the `Actions` section below.
   *
   * This feature will be deprecated quickly when named yields become available in
   * Ember.
   */
  // TODO implement this
  loadingComponentClass: null,

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
   * will add the attribute `hidden` to the `occluded-item` when ever it's content is hidden, cached, or
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
  scrollPosition: 0,

  /**!
   * If set, if scrollPosition is empty
   * at initialization, the component will
   * render starting at the end.
   */
  startFromEnd: false,
  __isInitializingFromEnd: false,

  /**!
   *
   */
  //TODO enable this feature.
  useLocalStorageCache: false,


  /**!
   * If set, upon initialization the scroll
   * position will be set such that the item
   * with the provided key is at the top or left.
   * If the item cannot be found, scrollTop/scrollLeft
   * is set to 0.
   */
  keyForStart: null,




  //–––––––––––––– Actions
  // These are delegated to by the appropriate collection
  __endReached: null, // e.g. bottomReached
  __startReached: null,
  __afterVisibleChanged: null, // e.g. bottomVisibleChanged
  __beforeVisibleChanged: null,


  //–––––––––––––– Private Internals
  _beforeVisible: null,
  _beforeVisibleIndex: 0,

  /**!
   * a cached jQuery reference to the container element
   */
  _container: null,

  /**!
   * caches the height/width of each item in the list
   */
  //TODO enable this feature.
  _dimensionCache: null, // TODO since this is a mixin this object {} needs initialized

  /**!
   * Cached reference to the last bottom item used
   * to notify `__afterReached` to prevent resending.
   */
  _lastAfterSent: null,

  /**!
   * Cached reference to the last top item used
   * to notify `__beforeReached` to prevent resending.
   */
  _lastBeforeSent: null,

  /**!
   * Cached reference to the last visible top item used
   * to notify `__beforeVisibleChanged` to prevent resending.
   */
  _lastVisibleBeforeSent: null,

  /**!
   * Cached reference to the last visible bottom item used
   * to notify `__afterVisibleChange` to prevent resending.
   */
  _lastVisibleAfterSent: null,

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
   Binary search for finding the topmost visible view.
   This is not the first visible item on screen, but the first
   item that will render it's content.

   @method findFirstRenderedView
   @param {Number} viewportStart The top/left of the viewport to search against
   @Param {Number} height adjustment TODO wtf is this
   @returns {Number} the index into childViews of the first view to render
   **/
  _findFirstRenderedView: function(viewportStart, adj) {

    // adjust viewportStart to prevent the randomized coin toss
    // from not finding a view when the pixels are off by < 1
    viewportStart -= 1;

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

      if (viewBottom > viewportStart) {
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


  /**!
   * @private
   */
  _updateChildStates: function () {

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

    while (bottomViewIndex <= lastIndex) {

      var component = this.childForItem(valueForIndex(items, bottomViewIndex));

      var viewTop = component.$().position().top;
      var viewBottom = viewTop + component.get('_height');

      // end the loop if we've reached the end of views we care about
      if (viewTop > edges.invisibleBottom) { break; }

      //above the upper invisible boundary
      if (viewBottom < edges.invisibleTop) {
        component.cull();

        //above the upper reveal boundary
      } else if (viewBottom < edges.visibleTop) {
        component.hide();

        //above the upper screen boundary
      } else if (viewBottom < edges.viewportTop) {
        component.show();
        if (bottomViewIndex === 0) {
          this.sendActionOnce('topReached', {
            item: component.get('content'),
            index: bottomViewIndex
          });
        }

        //above the lower screen boundary
      } else if(viewTop < edges.viewportBottom) {
        component.show();
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
        component.show();
        if (bottomViewIndex === lastIndex) {
          this.sendActionOnce('bottomReached', {
            item: component.get('content'),
            index: bottomViewIndex
          });
        }

        //above the lower invisible boundary
      } else { // (viewTop <= edges.invisibleBottom) {
        component.hide();
      }

      bottomViewIndex++;
    }

    var toCull = (items.slice(0, topViewIndex))
      .concat(items.slice(bottomViewIndex))
      .map((item) => {
        return this.childForItem(item);
      });

    //cull views
    toCull.forEach(function (v) { v.cull(); });

    //set scroll
    if (this.get('__isInitializingFromEnd')) {
      this._taskrunner.schedule('afterRender', this, function () {
        var last = this.$().get(0).lastElementChild;
        this.set('__isInitializingFromEnd', false);
        if (last) {
          last.scrollIntoView(false);
        }
      });
    }

  },


  _scheduleOcclusion: function() {

    // cache the scroll offset, and discard the cycle if
    // movement is within (x) threshold
    var scrollTop = this.get('_container').get(0).scrollTop;
    var _scrollTop = this.get('scrollPosition');
    var defaultHeight = this.__getEstimatedDefaultHeight();

    this._taskrunner.debounce(this.get('_cleanupScrollThrottle'));
    this.set(
      '_cleanupScrollThrottle',
      this._taskrunner.debounce(this, this._updateChildStates, this.get('scrollThrottle'))
    );

    if (Math.abs(scrollTop - _scrollTop) >= defaultHeight / 2) {
      this.set('scrollPosition', scrollTop);
      this._taskrunner.scheduleOnce('actions', this, this._updateChildStates);
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

    var scrollPosition = this.get('scrollPosition');
    var topVisibleKey = this.get('topVisibleKey');
    var key = this.get('keyForId');

    if (scrollPosition) {
      this.get('_container').get(0).scrollTop = scrollPosition;
    } else if (this.get('startFromEnd')) {
      var last = this.$().get(0).lastElementChild;
      this.set('__isInitializingFromEnd', true);
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
      this._updateChildStates();
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
        'scrollPosition',
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
      nextFrame(this, this._updateChildStates);
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
   * debounces a call to `_updateChildStates` afterwards to update what's visible
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
    this._taskrunner.debounce(this, this._updateChildStates, this.get('scrollThrottle'));

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
