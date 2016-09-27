import Satellite from './satellite';
import FastArray from 'perf-primitives/fast-array';
const LIST_SAT_POOL = new FastArray(200, 'ListSatellite Pool');

export default class ListSatellite extends Satellite {

  _heightDidChange(dY) {
    this.radar._adjust(this, { dX: 0, dY });
  }

  heightDidChange(dY) {
    return this._heightDidChange(dY);
  }

  next() {
    const nextComponent = this.component.next();

    return nextComponent ? nextComponent.satellite : null;
  }

  prev() {
    const prevComponent = this.component.prev();

    return prevComponent ? prevComponent.satellite : null;
  }

  static create(options) {
    let sat = LIST_SAT_POOL.pop();

    if (sat) {
      sat.init(options);
      return sat;
    }

    return new ListSatellite(options);
  }

  destroy() {
    this._destroy();

    this.heightDidChange = this._heightDidChange;

    LIST_SAT_POOL.push(this);
  }
}
