import Satellite from './satellite';

export default class ListSatellite extends Satellite {

  constructor(options, previousSatellite) {
    super(options);
    this._nextSatellite = undefined;
    this._prevSatellite = previousSatellite;
    if (previousSatellite) {
      previousSatellite._nextSatellite = this;
    }
  }

  heightDidChange(dY) {
    this.list._adjust(this, { dX: 0, dY });
  }

  next() {
    return this._nextSatellite;
  }

  prev() {
    return this._prevSatellite;
  }

  destroy() {
    super.destroy();
    if (this._nextSatellite) {
      this._nextSatellite._prevSatellite = this._prevSatellite;
    }
    if (this._prevSatellite) {
      this._prevSatellite._nextSatellite = this._nextSatellite;
    }
    this._nextSatellite = undefined;
    this._prevSatellite = undefined;
  }

}
