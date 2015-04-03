import Ember from "ember";
import MagicArrayMixin from "./magic-array-mixin";
import OcclusionView from "./occlusion-view";
import getTagDescendant from "./utils/get-tag-descendant";

//TODO enable scroll position cacheing
export default Ember.ContainerView.extend(MagicArrayMixin, {

  /**!
   * The view to use for each item in the list
   * If you need dynamic item types, you can use
   * a wrapper view to swap out the view based on
   * the model.
   */
  itemViewClass: null,
  _occludedView: null,
  content: Ember.A(),
  proxied: null,

  /**!
   * The amount of time to let pass before attempting to
   * render again
   */
  scrollDebounce: 16,
  cycleDelay: 25,
  updateBatchSize: 6,

  _scrollPosition: 0,

  /**!
   * caches the height of each item in the list
   */
  _heightCache: {},
  defaultHeight: 75,
  startItem: null,

  viewportHeight: 0,

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
   * sets how many views to cache in buffer
   * instead of tearing down on either side
   * of the revealed area
   */
  cacheBuffer: .5,

  _topVisible:    null,
  _bottomVisible: null,

  scrollSelector: null,

  /**!
   * Used when the bottom of infinite scroll is reached
   * and more records will be loaded.
   *
   * This view is only utilized if the bottom or top is reached
   * and willLoadRecords is true.
   *
   */
  loadingView: null,

  bottomVisibleChanged: null,
  topVisibleChanged: null,
  bottomReached: null,
  topReached: null,
  itemTagName: '',

  init: function() {

    var itemViewClass = this.get('itemViewClass');
    var defaultHeight = parseInt(this.get('defaultHeight'), 10);
    var collectionTagName = (this.get('tagName') || '').toLowerCase();
    var itemTagName = this.get('itemTagName') || getTagDescendant(collectionTagName);

    if (itemTagName === 'none') {
      itemTagName = '';
    }

    var keyForId = this.get('keyForId');
    Ember.assert('You must supply a key for the view', keyForId);

    this.set('itemViewClass', OcclusionView.extend({

      classNames: [itemViewClass + '-occlusion', 'occluded-view'],
      tagName : itemTagName,
      innerView: itemViewClass,
      defaultHeight: defaultHeight,

      keyForView: keyForId,

      context: this.get('context'),

      itemController: this.get('itemController')

    }));

    this._updateProxy();
    this._super();
    this._initViews();

  },

  _initViews: function() {

    var content = this.get('content');
    var viewClass = this.get('itemViewClass');
    var self = this;
    if (content) {
      content.forEach(function (item) {
        self.pushObject(self.createChildView(viewClass, { content: item}));
      });
    }

  },

  _window: null,
  _wrapper: null,

  wrapperSelector: null,
  _initEdges: function () {

    var wrapperSelector = this.get('wrapperSelector');
    var _wrapper = wrapperSelector ? Ember.$(wrapperSelector) : this.$().parent();
    var _window = Ember.$(window);
    this.set('_wrapper', _wrapper);
    this.set('_window', _window);

    // segment heights
    var viewportHeight = parseInt(this.get('viewportHeight'), 10) || _wrapper.height();
    var _visibleBufferHeight = Math.round(viewportHeight * this.get('visibleBuffer'));
    var _invisibleBufferHeight = Math.round(viewportHeight * this.get('invisibleBuffer'));
    var _cacheBufferHeight = Math.round(viewportHeight * this.get('cacheBuffer'));

    var _maxHeight = this.get('viewportHeight') ? this.$().height() : Ember.$('body').height();

    // segment top break points
    var viewportTop =_wrapper.position().top;
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

    console.log('edges', this.get('_edges'));

  },

  /**
   Binary search for finding the topmost view on screen.

   @method findTopView
   @param {Number} viewportTop The top of the viewport to search against
   @returns {Number} the index into childViews of the topmost view
   **/
  _findTopView: function(viewportTop) {

    var childViews = this._childViews;
    var maxIndex = childViews.length - 1;
    var minIndex = 0;
    var midIndex;

    if (maxIndex < 0) { return 0; }

    while(maxIndex > minIndex){

      midIndex = Math.floor((minIndex + maxIndex) / 2);

      // in case of not full-window scrolling
      var view = childViews[midIndex];
      var viewBottom = view.$().position().top + view.get('_height');

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

    var edges = this.get('_edges');
    var childViews = this._childViews;
    var topViewIndex = this._findTopView(edges.cacheTop);
    var bottomViewIndex = topViewIndex;
    var lastIndex = childViews.length - 1;

    if (!childViews[topViewIndex]) {
      this._initViews();
    }

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

    // Find the bottom view and cycle what's between
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

        //above the lower screen boundary
      } else if(viewTop < edges.viewportBottom) {
        toScreen.push(view);
        onscreen.push(view.get('content'));

        //above the lower reveal boundary
      } else if (viewTop < edges.visibleBottom) {
        toShow.push(view);

        //above the lower invisible boundary
      } else if (viewTop < edges.invisibleBottom) {
        toHide.push(view);

        //above the lower cache boundary
      } else { // (viewTop <= edges.cacheBottom) {
        toCache.push(view);

      }

      bottomViewIndex++;
    }

    toCull = toCull.concat(childViews.slice(0, topViewIndex)).concat(childViews.slice(bottomViewIndex + 1));

    // cancel any previous update
    //TODO possibly redundant?
    Ember.run.cancel(this._nextBatchUpdate);

    // update view states
    Ember.run.schedule('afterRender', this, function (toCull, toCache, toHide, toShow, toScreen) {

      //reveal on screen views
      toScreen.forEach(function (v) { v.show(); });

      // hide views
      toHide.forEach(function (v) { v.hide(); });

      // cache views
      toCache.forEach(function (v) { v.cache(); });

      //cull views
      toCull.forEach(function (v) { v.cull(); });

      Ember.run.cancel(this._nextBatchUpdate);
      this._nextBatchUpdate = Ember.run.later(this, this._updateViews, toShow, this.get('cycleDelay'));

    }, toCull, toCache, toHide, toShow, toScreen);

  },

  // update view states
  _nextBatchUpdate: null,
  _updateViews: function (toShow) {

    var updateBatchSize = this.get('updateBatchSize');
    var delay = this.get('cycleDelay');
    var processed = 0;
    var view = null;

    // reveal batch
    while (processed++ < updateBatchSize && toShow.length > 0) {
      view = toShow.shift();
      Ember.run.schedule('afterRender', view, view.show);
    }

    //schedule next batch
    if (toShow.length !== 0) {
      this._nextBatchUpdate = Ember.run.later(this, this._updateViews, toShow, delay);
    }

  },

  //TODO add more code comments

  _lastTopOffset: null,
  _scheduleOcclusion: function() {

    Ember.run.scheduleOnce('afterRender', this, this._cycleViews);

    var scrollDebounce = this.get('scrollDebounce');
    if (this.$()) {
      this.set('_lastTopOffset', this.$().position().top);
      Ember.run.debounce(this, this._detectMomentumScroll, scrollDebounce);
    }
  },

  _detectMomentumScroll: function() {
    var oldTop = this.get('_lastTopOffset');
    var scrollDebounce = this.get('scrollDebounce');
    if (oldTop !== this.$().position().top) {
      Ember.run.throttle(this, this._scheduleOcclusion, scrollDebounce);
    }
  },


  setup: Ember.on('didInsertElement', function() {

    var id = this.get('elementId');
    var scrollDebounce = this.get('scrollDebounce');
    var scrollSelector = this.get('scrollSelector');
    var $container = scrollSelector ? Ember.$(scrollSelector) : this.$().parent();

    var onScrollMethod = function onScrollMethod () {
      Ember.run.throttle(this, this._scheduleOcclusion, scrollDebounce);
    }.bind(this);

    $container.bind('scroll.occlusion-culling.' + id, onScrollMethod);
    $container.bind('touchmove.occlusion-culling.' + id, onScrollMethod);
    Ember.$(window).bind('resize.occlusion-culling.' + id, this._initEdges.bind(this));

    //schedule a rerender when the underlying content changes
    this.addObserver('content.@each', this, onScrollMethod);

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
  _cleanup: Ember.on('willDestroyElement', function() {

    //cleanup scroll
    var scrollSelector = this.get('scrollSelector');
    var id = this.get('elementId');
    var $container = scrollSelector ? Ember.$(scrollSelector) : this.$();

    $container.unbind('scroll.occlusion-culling.' + id);
    $container.unbind('touchmove.occlusion-culling.' + id);
    Ember.$(window).unbind('resize.occlusion-culling.' + id);

    //cache state
    var storageKey = this.get('storageKey');
    if (storageKey) {

      var keyForView = this.get('keyForView');
      var cacheAttrs = this.getProperties(
        '_scrollPosition',
        '_heights',
        '_topVisible',
        '_bottomVisible',
        '_visibleCount'
      );

      cacheAttrs._topVisible = cacheAttrs._topVisible.get(keyForView);
      cacheAttrs._bottomVisible = cacheAttrs._bottomVisible.get(keyForView);

      localStorage.setItem(storageKey, JSON.stringify(cacheAttrs));
    }

    //tear down cached views and DOM


  })


});
