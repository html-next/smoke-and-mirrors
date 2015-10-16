/* global Math */
import Ember from 'ember';

const {
  computed,
  guidFor,
  get: get
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


export default Ember.Object.extend({
  component: null,
  key:        null,
  rect:       null,
  position:   null,
  tracker: null,

  index: computed.readOnly('component.index'),

  shift(dX, dY, parentRect) {
    let rect = this.rect;
    if (dX) {
      rect.left += dX;
      rect.right += dX;
    }
    if (dY) {
      rect.bottom += dY;
      rect.top += dY;
    }
    this.component._position = this.getRelativePosition(rect, parentRect);
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
      distanceY: distanceY,
      _satellite: this
    };
  },

  resize() {
    let oldRect = this.rect;
    this.rect = getBoundaries(this.component.element);

    // if the height's don't match, we need to update
    // the positions of elements below ours
    if (oldRect && oldRect.height !== this.rect.height) {
      let adjustment = this.rect.height - oldRect.height;
      this.tracker.adjustPositions(this.component.get('index'), adjustment);
    }
  },

  init() {
    this._super();
    this.resize();
    this.set('key', guidFor(this.component));
  }
});
