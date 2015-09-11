/* global window, document, Math */
import Ember from 'ember';

const {
  Object,
  guidFor,
  A,
  run
  } = Ember;

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


let Satellite = Object.extend({
  component: null,
  key:        null,
  rect:       null,
  position:   null,

  shift(dX, dY, parentRect) {
    let rect = this.get('rect');
    if (dX) {
      rect.left += dX;
      rect.right += dX;
    }
    if (dY) {
      rect.bottom += dY;
      rect.top += dY;
    }
    let position = this.getRelativePosition(rect, parentRect);

    this.set('position', position);
    this.set('component._position', position);
  },

  getRelativePosition(rect, parentRect) {
    let distanceX;
    let distanceY;

    if (rect.bottom > parentRect.top) {
      distanceX = rect.bottom - parentRect.top;
    } else if (rect.top > parentRect.top) {
      distanceX = rect.top - parentRect.top;
    } else if (rect.top < parentRect.bottom) {
      distanceX = rect.top - parentRect.bottom;
    } else if (rect.bottom < parentRect.bottom) {
      distanceX = rect.bottom - parentRect.bottom;
    } else { //we're within the parentRect
      distanceX = 0;
    }

    if (rect.right > parentRect.left) {
      distanceY = rect.right - parentRect.left;
    } else if (rect.left > parentRect.left) {
      distanceY = rect.left - parentRect.left;
    } else if (rect.left < parentRect.right) {
      distanceY = rect.left - parentRect.right;
    } else if (rect.right < parentRect.right) {
      distanceY = rect.right - parentRect.right;
    } else { //we're within the parentRect
      distanceY = 0;
    }

    let zoneX = Math.floor(distanceX / parentRect.height);
    let zoneY = Math.floor(distanceY / parentRect.width);

    return {
      rect: rect,
      zoneX: zoneX,
      zoneY: zoneY,
      distanceX: distanceX,
      distanceY: distanceY
    };
  },

  resize() {
    this.set('rect', getBoundaries(this.get('component.element')));
  },

  init() {
    this._super();
    this.resize();
    this.set('key', guidFor(this.get('component')));
  }
});

export default Object.extend({
  components: null,

  position: 0,
  rect: null,
  element: null,

  resize() {
    this.get('components').forEach((c) => {
      c.resize();
    });
  },

  scroll() {
    let element = this.get('element');
    let lastPosition = this.get('position');
    let newPosition = {
      x: element.scrollLeft,
      y: element.scrollTop
    };
    let dX = lastPosition.x - newPosition.x;
    let dY = lastPosition.y - newPosition.y;

    this.set('position', newPosition);
    this.shift(dX, dY);
  },

  shift(dX, dY) {
    let rect = this.get('rect');
    this.get('components').forEach((c) => {
      c.shift(dX, dY, rect);
    });
  },

  getBoundaries() {
    this.set('rect', getBoundaries(this.get('element')));
  },

  register(component) {
    this.get('components').pushObject(Satellite.create({ component: component }));
  },

  unregister(component) {
    let key = guidFor(component);
    let components = this.get('components');
    let satellite = components.find((item) => {
      return item.get('key') === key;
    });
    if (satellite) {
      components.removeObject(satellite);
    }
  },

  init() {
    this._super();
    this.set('components', A());
  }

});

