import Ember from 'ember';
import Satellite from './position-satellite';

const {
  computed,
  guidFor,
  get: get
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

  resize() {
    this._satellites.forEach((c) => {
      c.resize();
    });
  },

  scroll() {
    let element = this.container;
    let lastPosition = this.position;

    let newPosition = {
      x: element.scrollLeft,
      y: element.scrollTop
    };
    let dX = lastPosition.x - newPosition.x;
    let dY = lastPosition.y - newPosition.y;

    this.position = newPosition;
    this.shift(dX, dY);
  },

  adjustPositions(index, amount) {
    let satellites = this.get('satellites');
    let length = get(satellites, 'length');
    for( let i = index + 1; i < length; i++) {
      let satellite = valueForIndex(satellites, i);
      satellite.shift(0, amount, this.rect);
    }
  },

  shift(dX, dY) {
    let rect = this.rect;
    this._satellites.forEach((c) => {
      c.shift(dX, dY, rect);
    });
    let scrollable = this.scrollableRect;
    if (dX) {
      scrollable.left += dX;
      scrollable.right += dX;
    }
    if (dY) {
      scrollable.bottom += dY;
      scrollable.top += dY;
    }

  },

  getBoundaries() {
    this.position = {
      x: this.container.scrollLeft,
      y: this.container.scrollTop
    };
    this.rect = getBoundaries(this.container);
    this.scrollableRect = getBoundaries(this.scrollable);
  },

  register(component) {
    this._satellites.pushObject(Satellite.create({ component: component, tracker: this }));
  },

  unregister(component) {
    let key = guidFor(component);
    let satellites = this._satellites;
    let satellite = satellites.find((item) => {
      return item.get('key') === key;
    });
    if (satellite) {
      satellites.removeObject(satellite);
    }
  },

  init() {
    this._super();
    this._satellites = Ember.A();
  }

});

