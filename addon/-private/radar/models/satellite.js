import Geography from './geography';
import VirtualElement from './element';
import FastArray from 'perf-primitives/fast-array';
import noop from '../utils/noop-fn';

const SAT_POOL = new FastArray(200, 'Satellite Pool');

export default class Satellite {

  constructor(options) {
    this.init(options);
  }

  init({ component, dimensions: defaultDimensions, element, key, radar, scalar }) {
    this.isVirtual = !element;
    this.radar = radar;
    this.element = VirtualElement.create(defaultDimensions, element);
    this.component = component;
    this.geography = new Geography(this.element);
    this.key = key;
    this.scalar = scalar || 1;

    if (component.registerSatellite) {
      component.registerSatellite(this);
    }
  }

  virtualize() {
    this.isVirtual = true;
    this.element.element = undefined;
    this.geography.element = undefined;
  }

  realize(element) {
    this.element.element = element;
    this.geography.element = element;

    this.isVirtual = false;
    this.recalc();
  }

  heightDidChange(/* delta */) {}
  widthDidChange(/* delta */) {}

  recalc() {
    let cached = this.geography.getState();

    this.resize();

    let dY = this.geography.top - cached.top;
    let dX = this.geography.left - cached.left;

    this.willShift(dY, dX);
    this.didShift(dY, dX);
  }

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

    return heightChange || widthChange ? { dX: widthChange, dY: heightChange } : undefined;
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

  _destroy() {
    if (this.component.unregisterSatellite) {
      this.component.unregisterSatellite();
    }

    // teardown internal objects
    this.element.destroy();
    this.element = undefined;
    this.component = undefined;
    this.geography.destroy();
    this.geography = undefined;
    this.radar = undefined;

    // teardown hooks
    this.willShift = noop;
    this.didShift = noop;
    this.heightDidChange = noop;
    this.widthDidChange = noop;
  }

  static create(options) {
    let sat = SAT_POOL.pop();

    if (sat) {
      sat.init(options);
      return sat;
    }

    return new Satellite(options);
  }

  destroy() {
    this._destroy();

    SAT_POOL.push(this);
  }
}
