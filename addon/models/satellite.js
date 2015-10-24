import Ember from 'ember';
import Geography from './geography';

const {
  guidFor,
  } = Ember;


class Satellite {

  constructor(component) {
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
    let cached = this.geography.getState();
    this.geography.setState();

    let heightChange = cached.height - this.geography.height;
    let widthChange = cached.width -this.geography.width;

    if (heightChange) {
      this.heightDidChange();
    }
    if (widthChange) {
      this.widthDidChange();
    }

    return heightChange || widthChange ? { dX: widthChange, dY: heightChange } : null;
  }


  shift(dY, dX) {
    if (dX) {
      this.geography.left -= dX;
      this.geography.right -= dX;
    }
    if (dY) {
      this.geography.bottom -= dY;
      this.geography.top -= dY;
    }
  }

}

export default Satellite;
