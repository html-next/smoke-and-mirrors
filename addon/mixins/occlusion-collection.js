/*global Array, parseFloat, Math */
import Ember from 'ember';
import getTagDescendant from '../utils/get-tag-descendant';
import keyForItem from '../mixins/key-for-item';
import proxied from '../computed/proxied-array';
import ListRadar from '../models/list-radar';
// import patchSetTimeout from '../lib/backburner-frames';
import SmartActionsMixin from './smart-actions';

/**
 * Investigations: http://jsfiddle.net/sxqnt/73/
 */
const {
  get: get,
  Mixin,
  computed,
  run
  } = Ember;


export default Mixin.create(SmartActionsMixin, keyForItem, {
  //–––––––––––––– Optional Settings
  /**!
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
  key: '@identity',

  //–––––––––––––– Performance Tuning
  /**!
   * Time (in ms) to debounce layout recalculations when
   * resizing the window.
   */
  resizeDebounce: 128,
  scrollThrottle: 8,

  /**!
   * how much extra room to keep visible and invisible on
   * either side of the viewport.
   *
   * This used to be two separate values (invisibleBuffer/visibleBuffer)
   * but these values have been unified to ease a future transition in
   * the internal mechanics of the collection to utilize DOM recycling.
   */
  bufferSize: 1,

  /**!
   * useContentProxy
   */
  useContentProxy: false,

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

  _content: null,

  //–––––––––––––– Private Internals
  _firstVisible: null,
  _firstVisibleIndex: 0,

  /**!
   * a cached element reference to the container "viewport" element
   * this is known as the "telescope" within the Radar class.
   */
  _container: null,

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


  shouldRenderList: computed('shouldRender', '_sm_canRender', function() {
    let shouldRender = this.get('shouldRender');
    let canRender = this.get('_sm_canRender');
    let doRender = shouldRender && canRender;
    let _shouldDidChange = this.get('__shouldRender') !== shouldRender;

    // trigger a cycle
    if (doRender && _shouldDidChange) {
      this._nextUpdate = run.scheduleOnce('actions', this, this._updateChildStates, 'shouldRenderList');
    }

    return doRender;
  }),


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

  /**
   * forward is true, backwards is false
   */
  _scrollIsForward: 0,
  radar: null,
  minimumMovement: 25,
  _nextUpdate: null,
  _nextTeardown: null,
  _nextMaintenance: null,
  _sm_scrollListener: null,
  _sm_resizeListener: null,
  _isPrepending: false,
  _children: null,


  //–––––––––––––– Action Helper Functions
  canSendActions(name/*, context*/) {
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

  /**
   Binary search for finding the topmost visible view.
   This is not the first visible item on screen, but the first
   item that will render it's content.

   @method _findFirstRenderedComponent
   @param {Number} viewportStart The top/left of the viewport to search against
   @param {Number} adj Height adjustment
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
      let componentBottom = component.satellite.geography.bottom + adj;

      if (componentBottom > viewportStart) {
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
    if (this.__isInitialized) {
      this._sm_scheduleUpdate('register');
    }
  },


  unregister(child) {
    this.get('_children').removeObject(child);
    if (this.__isInitialized && !this.get('isDestroying') && !this.get('isDestroyed')) {
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

    let edges = this.get('_edges');
    let childComponents = this.get('children');

    if (this._isFirstRender) {
      if (this.get('renderAllInitially')) {
        childComponents.forEach((i) => { i.show(); });

        //set scroll
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

    let currentViewportBound = this.radar.sky.top;
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

      let componentTop = component.satellite.geography.top;
      let componentBottom = component.satellite.geography.bottom;

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

    this._nextTeardown = run.debounce(this, this._removeComponents, toCull, toHide, 128);
    toShow.forEach((i) => { i.show(); });

    //set scroll
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
        firstVisible: { item: childComponents[topComponentIndex], index: topComponentIndex },
        lastVisible: { item: childComponents[bottomComponentIndex - 1], index: bottomComponentIndex - 1}
      });
    }
  },


  _sm_scheduleUpdate(source) {
    if (this._isPrepending) {
      return;
    }
    this._nextUpdate = run.scheduleOnce('actions', this, this._updateChildStates, source);
  },


  _scheduleOcclusion(dY /*, dX*/) {
    if (!this.__isInitialized || this._isPrepending) { return; }
    this.set('_scrollIsForward', dY > 0);
    this._sm_scheduleUpdate('scroll');
  },


  //–––––––––––––– Setup/Teardown
  setupContainer() {
    var resizeDebounce = this.resizeDebounce;
    let scrollThrottle = this.scrollThrottle;
    var containerSelector = this.get('containerSelector');

    let container;
    if (containerSelector === 'body') {
      container = window;
    } else {
      let $container = containerSelector ? this.$().closest(containerSelector) : this.$().parent();
      container = $container.get(0);

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
    }

    this._container = container;

    let onScrollMethod = (dY, dX) => {
      this._scheduleOcclusion(dY, dX);
    };

    let onResizeMethod = () => {
      this.notifyPropertyChange('_edges');
    };

    this.radar.setState({
      telescope: this._container,
      resizeDebounce: resizeDebounce,
      skyline: container === window ? document.body : this.element,
      minimumMovement: this.minimumMovement,
      scrollThrottle: scrollThrottle
    });
    this.radar.didResizeSatellites = onResizeMethod;
    this.radar.didShiftSatellites = onScrollMethod;
  },


  didInsertElement() {
    this._super();
    this._nextMaintenance = run.next(() => {
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
      this.radar.scrollContainer.scrollTop = scrollPosition;
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
      this.radar.scrollContainer.scrollTop = (firstVisibleIndex || 0) * this.__getEstimatedDefaultHeight();
    }

    this._nextMaintenance = run.next(this, () => {
      this.__isInitialized = true;
      this._updateChildStates('initializeScrollState');
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
  willDestroyElement() {
    //cleanup scroll
    this.radar.destroy();

    //clean up scheduled tasks
    run.cancel(this._nextUpdate);
    run.cancel(this._nextTeardown);
    run.cancel(this._nextMaintenance);
  },


  __prependComponents(addCount) {
    if (this.get('_sm_canRender')) {
      this._isPrepending = true;
      run.cancel(this._nextUpdate);
      this._nextUpdate = run.scheduleOnce('actions', this, function() {
        let heightPerItem = this.__getEstimatedDefaultHeight();
        this.radar.scrollContainer.scrollTop += (addCount * heightPerItem);
        this.radar.filterMovement();
        this._updateChildStates('prepend');
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
      viewportTop: rect.top,
      visibleTop: -1 * bufferSize * rect.top,
      invisibleTop: -2 * bufferSize * rect.top,
      viewportBottom: rect.bottom,
      visibleBottom: bufferSize * rect.bottom,
      invisibleBottom: 2 * bufferSize * rect.bottom
    };
  }),

  /**!
   * Initialize
   */
  _prepareComponent() {
    this.set('__shouldRender', this.get('shouldRender'));

    this._sm_actionCache = {
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
      this.set('_content', computed.alias('content'));
      this.set('didReceiveAttrs', this._didReceiveAttrs);
    }
  }
});





function valueForIndex(arr, index) {
  return arr.objectAt ? arr.objectAt(index) : arr[index];
}


function getContent(obj, isProxied) {
  let key = isProxied? 'content.content' : 'content';
  return get(obj, key);
}
