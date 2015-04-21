import Ember from "ember";
import MagicArrayMixin from "../../mixins/magic-array";
import OcclusionView from "./occlusion-item.view";
import getTagDescendant from "../../utils/get-tag-descendant";
import nextFrame from "../../utils/next-frame";

const {
  ContainerView,
  TargetActionSupport,
  run,
  assert,
  on,
  observer
} = Ember;

const {
  debounce,
  schedule,
  scheduleOnce,
  throttle,
  next,
  later,
  cancel
} = run;

const jQuery = Ember.$;

export default ContainerView.extend(TargetActionSupport, MagicArrayMixin, {

  //–––––––––––––– Required Settings

  /**!
   * The view to use for each item in `contentToProxy`
   * If you need dynamic item types, you can use
   * a wrapper view to swap out the view based on
   * the model.
   */
  itemViewClass: null,

  /**!
   * An array of content to render.  The array is proxied via the `MagicArrayMixin` before being used on screen.
   * If your content consists of Ember.Objects, the guid, is used to make this proxying even faster. Alternatively,
   * specify `keyForId`.  See the [docs for MagicArrayMixin](./magic-array.md) to learn more.  See below for more
   * on `keyForId`.
   *
   * This proxy behavior ensures that even should you do a full content swap, your performance doesn't suffer.
   * Just how fast is this proxy?  I've implemented the [*Ryan Florence Performance Test*™](http://discuss.emberjs.com/t/ryan-florences-react-talk-does-not-make-ember-look-very-good/7223)
   * (aka [Glimmer Demo](https://dbmonster.firebaseapp.com/)) using [Ember 1.11.0 and `smoke-and-mirrors`](http://runspired.github.io/smoke-and-mirrors/#/dbmon-occlusion-collection).
   *
   * Is Ember fast yet? [It doesn't matter what this says](https://is-ember-fast-yet.firebaseapp.com/), the answer is YES.
   * Just goes to show a good algorithm is always clutch ;)
   */
  contentToProxy: null,

  /**!
   * This height is used to give the `OcclusionItem`s height prior to their content being rendered.
   * This height is replaced with the actual rendered height once content is rendered for the first time.
   *
   * If your content will always have the height specified by `defaultHeight`, you can improve performance
   * by specifying `alwaysUseDefaultHeight: true`.
   */
  defaultHeight: "75px",


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
  tagName: 'div',

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
   */
  scrollThrottle: 32,

  /**!
   * When scrolling, new on screen items are immediately handled.
   * `cycleDelay` sets the amount of time to debounce before updating
   * off screen items.
   */
  cycleDelay: 25,

  /**!
   * Sets how many items to update view state for at a time when updating
   * offscreen items.
   */
  updateBatchSize: 6,

  /**!
   * how much extra room to keep visible on
   * either side of the visible area
   */
  visibleBuffer: .5,

  /**!
   * how much extra room to keep in DOM but
   * with `visible:false` set.
   */
  invisibleBuffer: .5,

  /**!
   * sets how many views to cache in buffer
   * instead of tearing down on either side
   * of the revealed area
   */
  cacheBuffer: .5,

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
   *
   */
  //TODO enable this feature.
  _scrollPosition: '',

  /**!
   *
   */
  _topVisible: null,

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
   * It will include the index and content of the item now visible.
   */
  //TODO enable this feature.
  topVisibleChanged: null,


  //–––––––––––––– Private Internals


  /**!
   * The content array of proxied content.
   */
  __content: null,

  /**!
   * The property to proxy `contentToProxy` to.
   */
  __proxyContentTo: '__content',

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
   * cached Scheduled Task reference for cancelling
   * and replacing the task.
   */
  _nextBatchUpdate: null,

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
   * If true, views are currently being added above the visible portion of
   * the screen and scroll/cycle callbacks should be ignored.
   */
  __isPrepending: false,

  /**!
   * If a prepend will occur, this stores the data that the callback
   * provided to requestAnimationFrame will use.
   */
  __prependViewParams: null,


  //–––––––––––––– Helper Functions


  sendAction: function(name, context) {
    var action = this.get(name);
    if (action) {
      next(this, this.triggerAction, {
        action: action,
        actionContext: context,
        target: this.get('controller')
      });
    }
  },


  sendActionOnce: function(name, context) {

    // don't trigger during a prepend
    if (this.get('__isPrepending')) {
      return;
    }

    if (name === 'bottomReached' && this.get('_lastBottomSent') === context.item) {
      return;
    }
    if (name === 'topReached' && this.get('_lastTopSent') === context.item) {
      return;
    }
    if (name === 'bottomReached') {
      this.set('_lastBottomSent', context.item);
    }
    if (name === 'topReached') {
      this.set('_lastTopSent', context.item);
    }
    this.sendAction(name, context);
  },


  /**
   Binary search for finding the topmost view on screen.

   @method findTopView
   @param {Number} viewportTop The top of the viewport to search against
   @returns {Number} the index into childViews of the topmost view
   **/
  _findTopView: function(viewportTop, adj) {

    var childViews = this._childViews;
    var maxIndex = childViews.length - 1;
    var minIndex = 0;
    var midIndex;

    if (maxIndex < 0) { return 0; }

    while(maxIndex > minIndex){

      midIndex = Math.floor((minIndex + maxIndex) / 2);

      // in case of not full-window scrolling
      var view = childViews[midIndex];
      var viewBottom = view.$().position().top + view.get('_height') + adj;

      if (viewBottom > viewportTop) {
        maxIndex = midIndex - 1;
      } else {
        minIndex = midIndex + 1;
      }
    }

    return minIndex;
  },


  // on scroll, determine view states
  _cycleViews: function () {

    if (this.get('__isPrepending')) {
      return false;
    }
    var edges = this.get('_edges');
    var childViews = this._childViews;

    var currentViewportBound = edges.viewportTop + this.$().position().top;
    var currentUpperBound = edges.cacheTop;

    if (currentUpperBound < currentViewportBound) {
      currentUpperBound = currentViewportBound;
    }

    var topViewIndex = this._findTopView(currentUpperBound, edges.viewportTop);
    var bottomViewIndex = topViewIndex;
    var lastIndex = childViews.length - 1;

    // views to cull
    var toCull = [];

    // views to cache
    var toCache = [];

    // views to hide
    var toHide = [];

    // views to show
    var toShow = [];

    // views on screen
    var toScreen = [];

    // onscreen content
    var onscreen = [];

    while (bottomViewIndex <= lastIndex) {

      var view = childViews[bottomViewIndex];
      var viewTop = view.$().position().top;
      var viewBottom = viewTop + view.get('_height');

      // end the loop if we've reached the end of views we care about
      if (viewTop > edges.cacheBottom) { break; }

      //above the upper cache boundary
      if (viewBottom < edges.cacheTop) {
        toCull.push(view);

        //above the upper invisible boundary
      } else if (viewBottom < edges.invisibleTop) {
        toCache.push(view);

        //above the upper reveal boundary
      } else if (viewBottom < edges.visibleTop) {
        toHide.push(view);

        //above the upper screen boundary
      } else if (viewBottom < edges.viewportTop) {
        toShow.push(view);
        if (bottomViewIndex === 0) {
          this.sendActionOnce('topReached', {
            item: view.get('content.content'),
            index: lastIndex
          });
          this.set('_topVisible', view);
        }

        //above the lower screen boundary
      } else if(viewTop < edges.viewportBottom) {
        toScreen.push(view);
        onscreen.push(view.get('content'));
        if (bottomViewIndex === 0) {
          this.sendActionOnce('topReached', {
            item: view.get('content.content'),
            index: lastIndex
          });
          this.set('_topVisible', view);
        }
        if (bottomViewIndex === lastIndex) {
          this.sendActionOnce('bottomReached', {
            item: view.get('content.content'),
            index: lastIndex
          });
        }

        //above the lower reveal boundary
      } else if (viewTop < edges.visibleBottom) {
        toShow.push(view);
        if (bottomViewIndex === lastIndex) {
          this.sendActionOnce('bottomReached', {
            item: view.get('content.content'),
            index: lastIndex
          });
        }

        //above the lower invisible boundary
      } else if (viewTop < edges.invisibleBottom) {
        toHide.push(view);

        //above the lower cache boundary
      } else { // (viewTop <= edges.cacheBottom) {
        toCache.push(view);

      }

      bottomViewIndex++;
    }

    toCull = toCull.concat(childViews.slice(0, topViewIndex)).concat(childViews.slice(bottomViewIndex));

    // cancel any previous update
    //TODO possibly redundant?
    cancel(this._nextBatchUpdate);

    // update view states
    schedule('afterRender', this, function updateViewStates(toCull, toCache, toHide, toShow, toScreen) {

      //reveal on screen views
      toScreen.forEach(function (v) { v.show(); });

      // hide views
      toHide.forEach(function (v) { v.hide(); });

      // cache views
      toCache.forEach(function (v) { v.cache(); });

      //cull views
      toCull.forEach(function (v) { v.cull(); });

      cancel(this._nextBatchUpdate);
      this._nextBatchUpdate = later(this, this._updateViews, toShow, this.get('cycleDelay'));

    }, toCull, toCache, toHide, toShow, toScreen);

  },

  // update view states
  _updateViews: function(toShow) {

    var updateBatchSize = this.get('updateBatchSize');
    var delay = this.get('cycleDelay');
    var processed = 0;
    var view = null;

    // reveal batch
    while (processed++ < updateBatchSize && toShow.length > 0) {
      view = toShow.shift();
      schedule('afterRender', view, view.show);
    }

    //schedule next batch
    if (toShow.length !== 0) {
      this._nextBatchUpdate = later(this, this._updateViews, toShow, delay);
    }

  },

  _scheduleOcclusion: function() {
    scheduleOnce('afterRender', this, this._cycleViews);
  },





  //–––––––––––––– Setup/Teardown

  setup: on('didInsertElement', function() {

    var id = this.get('elementId');
    var scrollThrottle = this.get('scrollThrottle');
    var containerSelector = this.get('containerSelector');
    var _container = containerSelector ? jQuery(containerSelector) : this.$().parent();
    this.set('_container', _container);

    // This may need vendor prefix detection
    _container.css({
      '-webkit-transform' : 'translate3d(0,0,0)',
      '-moz-transform'    : 'translate3d(0,0,0)',
      '-ms-transform'     : 'translate3d(0,0,0)',
      '-o-transform'      : 'translate3d(0,0,0)',
      'transform'         : 'translate3d(0,0,0)',
      '-webkit-overflow-scrolling': 'touch',
      'overflow-scrolling': 'touch'
    });

    var onScrollMethod = function onScrollMethod () {
      if (this.get('__isPrepending')) {
        return false;
      }
      throttle(this, this._scheduleOcclusion, scrollThrottle);
    }.bind(this);

    _container.bind('scroll.occlusion-culling.' + id, onScrollMethod);
    _container.bind('touchmove.occlusion-culling.' + id, onScrollMethod);
    jQuery(window).bind('resize.occlusion-culling.' + id, this._initEdges.bind(this));

    //draw initial boundaries
    this._initEdges();

    //schedule the initial render
    //TODO does this using afterRender delay initial rendering too long?
    this._scheduleOcclusion();

  }),


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

    //tear down cached views and DOM


  }),

  _getTrueDefaultHeight: function() {
    var defaultHeight = '' + this.get('defaultHeight');
    if (defaultHeight.indexOf('em') === -1) {
      return parseInt(defaultHeight, 10);
    }
    var element;

    // use body if rem
    if (defaultHeight.indexOf('rem')) {
      element = window.document.body;
    } else {

      // use an actual child if we have one
      if (this._topVisible && this._topVisible.get('element')) {
        element = this._childViews[0].get('element');

      // use the occlusion component
      } else {
        element = this.get('element');
      }
    }

    var fontSize = window.getComputedStyle(element).getPropertyValue('fontSize');
    return parseInt(defaultHeight, 10) * parseInt(fontSize, 10);

  },

  __performViewPrepention: function() {

    this.set('__isPrepending', true);

    var params = this.__prependViewParams;
    var container = this.get('_container').get(0);
    var added = params.addCount * this._getTrueDefaultHeight();

    this.replace(params.offset, 0, params.affectedViews);
    container.scrollTop += added;

    this.__prependViewParams = null;

    next(this, function() {
      this.set('__isPrepending', false);

      // ensure that visible views are recalculated following an array length change
      nextFrame(this, this._cycleViews);
    });
  },

  _reflectContentChanges: function() {
    var content = this.get('__content');
    var self = this;
    var viewClass = this.get('itemViewClass');
    if (!content) {
      throw "Content not available to observe!";
    }

    content.contentArrayDidChange = function handleArrayChange(items, offset, removeCount, addCount) {
      var affectedViews = [], i;
      if (removeCount) {
        self.replace(offset, removeCount, []);

      } else if (addCount) {

        for (i = offset; i < offset + addCount; i++) {
          affectedViews.push(self.createChildView(viewClass, { content: items[i]}));
        }

        if (offset <= self.indexOf(self.get('_topVisible'))) {
          self.__prependViewParams = {
            offset: offset,
            addCount: addCount,
            affectedViews: affectedViews
          };
          nextFrame(self, self.__performViewPrepention);
        } else {
          self.replace(offset, 0, affectedViews);

          // ensure that visible views are recalculated following an array length change
          nextFrame(self, self._cycleViews);
        }

      }
    };

  },

  /**!
   * Initialize views for the proxied content.  It
   * uses the same diffing behavior as the proxy
   * itself to adjust it's length;
   *
   * It should only be called once.
   *
   * @private
   */
  _initViews: function() {

    var content = this.get('__content');
    var viewClass = this.get('itemViewClass');
    var self = this;

    if (!content) {
      throw "Content not available to _initViews!";
    }
    this.beginPropertyChanges();

    content.forEach(function (item) {
      self.pushObject(self.createChildView(viewClass, { content: item}));
    });

    this.endPropertyChanges();

    this._reflectContentChanges();

  },


  _initEdges: observer('containerHeight', function calculateViewStateBoundaries() {

    var _container = this.get('_container');

    // segment heights
    var viewportHeight = parseInt(this.get('containerHeight'), 10) || _container.height();
    var _visibleBufferHeight = Math.round(viewportHeight * this.get('visibleBuffer'));
    var _invisibleBufferHeight = Math.round(viewportHeight * this.get('invisibleBuffer'));
    var _cacheBufferHeight = Math.round(viewportHeight * this.get('cacheBuffer'));

    var _maxHeight = this.get('containerHeight') ? this.$().height() : jQuery('body').height();

    // segment top break points
    var viewportTop =_container.position().top;
    var visibleTop = viewportTop - _visibleBufferHeight;
    var invisibleTop = visibleTop - _invisibleBufferHeight;
    var cacheTop = invisibleTop - _cacheBufferHeight;

    // segment bottom break points
    var viewportBottom = viewportTop + viewportHeight;

    // cap this break points to bottom
    if (viewportBottom > _maxHeight) { viewportBottom = _maxHeight; }

    var visibleBottom = viewportBottom + _visibleBufferHeight;
    var invisibleBottom = visibleBottom + _invisibleBufferHeight;
    var cacheBottom = invisibleBottom + _cacheBufferHeight;

    this.set('_edges', {
      cacheTop: cacheTop,
      invisibleTop: invisibleTop,
      visibleTop: visibleTop,
      viewportTop: viewportTop,
      viewportBottom: viewportBottom,
      visibleBottom: visibleBottom,
      invisibleBottom: invisibleBottom,
      cacheBottom: cacheBottom
    });

    Ember.Logger.debug('Edges', this.get('_edges'));

    // ensure that visible views are recalculated following a resize
    debounce(this, this._cycleViews, this.get('scrollThrottle'));

  }),

  /**!
   *
   */
  init: function() {

    var prependFn = this.__performViewPrepention.bind(this);
    this.set('__performViewPrepention', prependFn);

    var itemViewClass = this.get('itemViewClass');
    var defaultHeight = this.get('defaultHeight');
    var collectionTagName = (this.get('tagName') || '').toLowerCase();
    var itemTagName = this.get('itemTagName') || getTagDescendant(collectionTagName);


    if (itemTagName === 'none') {
      itemTagName = '';
    }

    var keyForId = this.get('keyForId');
    assert('You must supply a key for the view', keyForId);

    this.set('itemViewClass', OcclusionView.extend({

      classNames: [itemViewClass + '-occlusion', 'occluded-view'],
      tagName : itemTagName,
      innerView: itemViewClass,
      defaultHeight: defaultHeight,

      _height:  this.get('alwaysUseDefaultHeight') ? defaultHeight : null,

      keyForId: keyForId,

      context: this.get('context'),

      itemController: this.get('itemController')

    }));

    this._updateProxy();
    this._super();
    this._initViews();

  }


});
