import Ember from 'ember';
import getTagDescendant from '../utils/get-tag-descendant';
import nextFrame from '../utils/next-frame';
import Scheduler from '../utils/backburner-ext';
import jQuery from 'jquery';

const IS_GLIMMER = (Ember.VERSION.indexOf('2') === 0 || Ember.VERSION.indexOf('1.13') === 0);

/**
 * Investigations: http://jsfiddle.net/sxqnt/73/
 */
const {
  get: get,
  Mixin,
  assert,
  computed,
  run,
  on,
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
  //TODO find better prop name
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
   * render starting at the bottom.
   */
  renderFromLast: false,
  __isInitializingFromLast: false,

  /**!
   * If set, all items will initially be revealed
   * so that their dimensions can be correctly
   * determined
   */
  // TODO enable this feature
  renderAllInitially: false,

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


  //–––––––––––––– Private Internals
  _firstVisible: null,
  _firstVisibleIndex: 0,

  /**!
   * a cached jQuery reference to the container element
   */
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
   * If true, views are currently being added above the visible portion of
   * the screen and scroll/cycle callbacks should be ignored.
   */
  __isPrepending: false,

  /**!
   * false until the first full setup has completed
   */
  __isInitialized: false,

  shouldGPUAccelerate: true,
  shouldRender: true,
  canRender: false,

  __shouldRender: true,
  shouldRenderList: computed('shouldRender', 'canRender', function() {
    let shouldRender = this.get('shouldRender');
    let canRender = this.get('canRender');
    let doRender = shouldRender && canRender;
    let _shouldDidChange = this.get('__shouldRender') !== shouldRender;

    // trigger a cycle
    if (doRender && _shouldDidChange) {
      run.next(this, this._updateChildStates);
    }

    return doRender;
  }),

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

   @method _findFirstRenderedComponent
   @param {Number} viewportStart The top/left of the viewport to search against
   @Param {Number} height adjustment TODO wtf is this
   @returns {Number} the index into childViews of the first view to render
   **/
  _findFirstRenderedComponent: function(viewportStart, adj) {

    // adjust viewportStart to prevent the randomized coin toss
    // from not finding a view when the pixels are off by < 1
    viewportStart -= 1;

    // GLIMMER: var items = this.get('content');
    var childComponents = this._getChildren();
    var maxIndex = get(childComponents, 'length') - 1;
    var minIndex = 0;
    var midIndex;

    if (maxIndex < 0) { return 0; }

    while(maxIndex > minIndex){

      midIndex = Math.floor((minIndex + maxIndex) / 2);

      // in case of not full-window scrolling
      // GLIMMER: var component = this.childForItem(valueForIndex(items, midIndex));
      var component = childComponents[midIndex];
      var componentBottom = component.$().position().top + component.get('_height') + adj;

      if (componentBottom > viewportStart) {
        maxIndex = midIndex - 1;
      } else {
        minIndex = midIndex + 1;
      }
    }

    return minIndex;
  },

  // this method MUST be implemented by the consuming collection
  _getChildren: null,

  childForItem: function(item, index) {
    let key = this.keyForItem(item, index);
    return this._getChildren()[key];
  },

  /**!
   *
   * The big question is can we render from the bottom
   * without the bottom most item being taken off screen?
   *
   * Triggers on scroll.
   *
   * @returns {boolean}
   * @private
   */
  _updateChildStates() {

    if (this.get('__isPrepending') || !this.get('shouldRenderList')) {
      return false;
    }

    let edges = this.get('_edges');
    let childComponents = this._getChildren();

    let currentViewportBound = edges.viewportTop + this.$().position().top;
    let currentUpperBound = edges.invisibleTop;

    if (currentUpperBound < currentViewportBound) {
      currentUpperBound = currentViewportBound;
    }

    let topComponentIndex = this._findFirstRenderedComponent(currentUpperBound, edges.viewportTop);
    let bottomComponentIndex = topComponentIndex;
    let lastIndex = get(childComponents, 'length') - 1;
    let topVisibleSpotted = false;

    while (bottomComponentIndex <= lastIndex) {

      let component = childComponents[bottomComponentIndex];

      let componentTop = component.$().position().top;
      let componentBottom = componentTop + component.get('_height');

      // end the loop if we've reached the end of components we care about
      if (componentTop > edges.invisibleBottom) { break; }

      //above the upper invisible boundary
      if (componentBottom < edges.invisibleTop) {
        component.cull();

        //above the upper reveal boundary
      } else if (componentBottom < edges.visibleTop) {
        component.hide();

        //above the upper screen boundary
      } else if (componentBottom < edges.viewportTop) {
        component.show();
        if (bottomComponentIndex === 0) {
          this.sendActionOnce('firstReached', {
            item: component.get('content.content'),
            index: bottomComponentIndex
          });
        }

        //above the lower screen boundary
      } else if(componentTop < edges.viewportBottom) {
        component.show();
        if (bottomComponentIndex === 0) {
          this.sendActionOnce('firstReached', {
            item: component.get('content.content'),
            index: bottomComponentIndex
          });
        }
        if (bottomComponentIndex === lastIndex) {
          this.sendActionOnce('lastReached', {
            item: component.get('content.content'),
            index: bottomComponentIndex
          });
        }

        if (!topVisibleSpotted) {
          topVisibleSpotted = true;
          this.set('_firstVisible', component);
          this.set('_firstVisibleIndex', bottomComponentIndex);
          this.sendActionOnce('firstVisibleChanged', {
            item: component.get('content.content'),
            index: bottomComponentIndex
          });
        }
        this.set('_lastVisible', component);
        this.sendActionOnce('lastVisibleChanged', {
          item: component.get('content.content'),
          index: bottomComponentIndex
        });

        //above the lower reveal boundary
      } else if (componentTop < edges.visibleBottom) {
        component.show();
        if (bottomComponentIndex === lastIndex) {
          this.sendActionOnce('lastReached', {
            item: component.get('content.content'),
            index: bottomComponentIndex
          });
        }

        //above the lower invisible boundary
      } else { // (componentTop <= edges.invisibleBottom) {
        component.hide();
      }

      bottomComponentIndex++;
    }

    let toCull = (childComponents.slice(0, topComponentIndex))
      .concat(childComponents.slice(bottomComponentIndex));

    //cull views
    toCull.forEach((v) => { v.cull(); });

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

  },


  _scheduleOcclusion: function() {

    // cache the scroll offset, and discard the cycle if
    // movement is within (x) threshold
    // TODO make this work horizontally too
    var scrollTop = this.get('_container').get(0).scrollTop;
    var _scrollTop = this.get('scrollPosition');
    var defaultHeight = this.__getEstimatedDefaultHeight();

    this._taskrunner.cancel(this.get('_cleanupScrollThrottle'));
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
  setupContainer: function() {

    var id = this.get('elementId');
    var scrollThrottle = this.get('scrollThrottle');
    var containerSelector = this.get('containerSelector');
    var _container = containerSelector ? this.$().closest(containerSelector) : this.$().parent();
    this.set('_container', _container);

    // TODO This may need vendor prefix detection
    _container.css({
      '-webkit-overflow-scrolling': 'touch',
      'overflow-scrolling': 'touch'
    });

    if (this.get('shouldGPUAccelerate')) {
      _container.css({
        '-webkit-transform' : 'translate3d(0,0,0)',
        '-moz-transform'    : 'translate3d(0,0,0)',
        '-ms-transform'     : 'translate3d(0,0,0)',
        '-o-transform'      : 'translate3d(0,0,0)',
        'transform'         : 'translate3d(0,0,0)'
      });
    }

    var onScrollMethod = function onScrollMethod() {
      if (this.get('__isPrepending') || !this.get('__isInitialized')) {
        return false;
      }
      this._taskrunner.throttle(this, this._scheduleOcclusion, scrollThrottle);
    }.bind(this);

    var onResizeMethod = function onResizeMethod() {
      this._taskrunner.debounce(this, this.notifyPropertyChange, '_edges', scrollThrottle, false);
    }.bind(this);

    _container.bind('scroll.occlusion-culling.' + id, onScrollMethod);
    _container.bind('touchmove.occlusion-culling.' + id, onScrollMethod);
    jQuery(window).bind('resize.occlusion-culling.' + id, onResizeMethod);

  },

  _allowRendering: on('didInsertElement', function() {
    this.setupContainer();
    this.set('canRender', true);
    //draw initial boundaries
    this._initializeScrollState();

  }),


  _initializeScrollState: function() {

    this.set('__isPrepending', true);

    var scrollPosition = this.get('scrollPosition');
    var idForFirstItem = this.get('idForFirstItem');
    var key = this.get('keyForId');

    if (scrollPosition) {
      this.get('_container').get(0).scrollTop = scrollPosition;
    } else if (this.get('renderFromLast')) {
      var last = this.$().get(0).lastElementChild;
      this.set('__isInitializingFromLast', true);
      if (last) {
        last.scrollIntoView(false);
      }
    } else if (idForFirstItem) {
      var content = this.get('content');
      var firstVisibleIndex;

      for (let i = 0; i < content.get('length'); i++) {
        if (idForFirstItem === get(valueForIndex(content, i), key)) {
          firstVisibleIndex = i;
        }
      }
      this.get('_container').get(0).scrollTop = (firstVisibleIndex || 0) * this.__getEstimatedDefaultHeight();
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
        '__dimensions',
        '_firstVisible',
        '_lastVisible'
      );

      cacheAttrs._firstVisible = cacheAttrs._firstVisible.get(keyForId);
      cacheAttrs._lastVisible = cacheAttrs._lastVisible.get(keyForId);

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
  _edges: computed('_container', 'containerHeight', 'shouldRenderList', function calculateViewStateBoundaries() {

    if (!this.get('shouldRenderList') && this.get('__edges')) {
      return this.get('__edges');
    }

    var _container = this.get('_container');
    if (!_container) {
      return;
    }
    var edges = {};
    var containerHeight = this.get('containerHeight');

    // segment heights
    var viewportHeight = parseInt(containerHeight, 10) || _container.height();
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

    this.set('__edges', edges);
    return edges;

  }),

  /**!
   * Initialize
   */
  _prepareComponent: function() {

    var prependFn = this.__performViewPrepention.bind(this);
    this.set('__performViewPrepention', prependFn);
    this.set('__shouldRender', this.get('shouldRender'));

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

  init() {
    this._super();
    this._prepareComponent();
  }


});
