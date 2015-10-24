import Ember from 'ember';
import Satellite from '../primitives/position-satellite';
import PositionTracker from '../primitives/position-tracker';

const {
  computed,
  guidFor,
  get: get,
  } = Ember;

function valueForIndex(arr, index) {
  return arr.objectAt ? arr.objectAt(index) : arr[index];
}

function getBoundaries(element) {
  let Rect = element.getBoundingClientRect();
  return {
    width: Rect.width,
    height: Rect.height,
    top: Rect.top,
    bottom: Rect.bottom,
    left: Rect.left,
    right: Rect.right
  };
}

export default Ember.Object.extend({
  _satellites: null,
  satellites: computed('_satellites.@each.index', function() {
    let satellites = this._satellites;
    let output = new Array(get(satellites, 'length'));
    satellites.forEach((item) => {
      let index = get(item, 'index');
      output[index] = item;
    });
    return output;
  }),

  position: null,
  rect: null,
  container: null,
  scrollable: null,

  // call this to add your component to the notifier during `didInsertElement`
  register(component, opts) {
    TrackedComponents.addObject(
      TrackedItem.create({ component: component, opts: opts })
    );
  },

  // call this to remove your component during `willDestroyElement`
  unregister(component) {
    let TrackedItem = findComponent(guidFor(component));
    if (TrackedItem) {
      TrackedComponents.removeObject(TrackedItem);
    }
  },

  throttleResize: function() {
    run.throttle(this, resizeTrackedComponents, 16);
  },

  throttlePositionUpdate: function() {
    run.throttle(this, updateTrackedComponents, 16);
  },

  _sm_resizeHandler: null,
  _sm_scrollHandler: null,
  minimumMovement: 25,
  isEarthquake(a, b) {
    return (Math.abs(b - a) >= this.minimumMovement);
  },
  scheduleScroll() {
    // cache the scroll offset, and discard the cycle if
    // movement is within (x) threshold
    let scrollTop = this._container.scrollTop;
    let scrollLeft = this._container.scrollLeft;
    let _scrollTop = this.scrollTop;
    let _scrollLeft = this.scrollLeft;

    if (this.isEarthquake(_scrollTop, scrollTop) || this.isEarthquake(_scrollLeft, scrollLeft)) {
      this.scrollTop = scrollTop;
      this.scrollLeft = scrollLeft;
      this._sm_scroll();
    }
  },

  resizeThrottle: 64,
  scheduleResize() {
    this._taskrunner.debounce(this, this._sm_resize, this.resizeThrottle);
  },

  setupHandlers() {
    this._sm_resizeHandler = () => {
      this.scheduleScroll();
    };
    this._sm_scrollHandler = () => {
      this.scheduleResize();
    };


  },
  teardownHandlers() {

  },

  init() {
    this._super(...arguments);
    this._tracker = PositionTracker.create({
      container: document.body,
      scrollable: window
    });
    this._tracker.getBoundaries();

    ViewportDimensions.height = window.innerHeight;
    ViewportDimensions.width = window.innerWidth;

    ScrollPosition.x = document.body.scrollLeft;
    ScrollPosition.y = document.body.scrollTop;

    window.addEventListener('resize', () => {
      ViewportDimensions.height = window.innerHeight;
      ViewportDimensions.width = window.innerWidth;
      this.throttleResize();
    }, true);

    window.addEventListener('scroll', updateTrackedComponents, true);

    document.addEventListener('touchmove', updateTrackedComponents, true);

    this._super();
  }

});



var ViewportDimensions = {
  height: window.innerHeight,
  width: window.innerWidth
};
var ScrollPosition = {
  x: document.body.scrollLeft,
  y: document.body.scrollTop
};
