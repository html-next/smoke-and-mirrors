import Ember from 'ember';
import Geography from './geography';

const {
  guidFor
  } = Ember;

class Satellite {

  constructor(component, radar) {
    this.radar = radar;
    this.component = component;
    this.element = component.element;
    this.geography = new Geography(this.element);
    this.key = guidFor(component);
    if (component.registerSatellite) {
      component.registerSatellite(this);
    }
  }

  heightDidChange(/* delta */) {}
  widthDidChange(/* delta */) {}

  resize() {
    const cached = this.geography.getState();

    this.geography.setState();

    const heightChange = this.geography.height - cached.height;
    const widthChange = this.geography.width - cached.width;

    if (heightChange) {
      this.heightDidChange(-1 * heightChange);
    }
    if (widthChange) {
      this.widthDidChange(-1 * widthChange);
    }

    return heightChange || widthChange ? { dX: widthChange, dY: heightChange } : null;
  }

  _shift(dY, dX) {
    this.geography.left -= dX;
    this.geography.right -= dX;
    this.geography.bottom -= dY;
    this.geography.top -= dY;
  }

  willShift() {}
  didShift() {}

  shift(dY, dX) {
    this.willShift(dY, dX);
    this._shift(dY, dX);
    this.didShift(dY, dX);
  }

  destroy() {
    if (this.component.unregisterSatellite) {
      this.component.unregisterSatellite();
    }
    this.component = null;
    this.satellite = null;
    this.element = null;
    this.geography.destroy();
    this.geography = null;
    this.radar = null;
  }

}

export default Satellite;
