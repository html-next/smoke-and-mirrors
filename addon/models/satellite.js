import Geography from './geography';
import VirtualElement from './element';

class Satellite {

  constructor({ id, radar, element, dimensions:defaultDimensions, scalar }) {
    this.isVirtual = !!element;
    this.radar = radar;
    this.element = new VirtualElement(defaultDimensions, element);
    this.geography = new Geography(this.element);
    this.key = id;
    this.scalar = scalar;
  }

  virtualize() {
    this.isVirtual = true;
    this.element.element = null;
    this.geography.element = null;
  }

  realize(element) {
    this.element.element = element;
    this.geography.element = element;
    if (this.isVirtual) {
      this.isVirtual = false;
      this.geography.setState();
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

  getZones() {
    return {
      y: this.getYZone(),
      x: this.getXZone()
    };
  }

  getYZone() {
    const satGeo = this.geography;
    const { planet } = this.radar;
    let distance = 0;
    const yScalar = planet.height * this.scalar;

    if (satGeo.bottom > planet.top) {
      distance = satGeo.bottom - planet.top;
      return Math.floor(distance / yScalar);
    } else if (satGeo.top < planet.bottom) {
      distance = satGeo.top - planet.bottom;
      return Math.ceil(distance / yScalar);
    }

    return 0;
  }

  getXZone() {
    const satGeo = this.geography;
    const { planet } = this.radar;
    let distance = 0;
    const xScalar = planet.width * this.scalar;

    if (satGeo.right > planet.left) {
      distance = satGeo.right - planet.left;
      return Math.floor(distance / xScalar);
    } else if (satGeo.left < planet.right) {
      distance = satGeo.left - planet.right;
      return Math.ceil(distance / xScalar);
    }

    return 0;
  }

  destroy() {
    // teardown internal objects
    this.element.destroy();
    this.element = null;
    this.geography.destroy();
    this.geography = null;

    // teardown hooks
    this.willShift = null;
    this.didShift = null;
    this.heightDidChange = null;
    this.widthDidChange = null;

    this.radar = null;
  }

}

export default Satellite;
