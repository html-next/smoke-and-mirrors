import Satellite from './satellite';

export default class VirtualItem extends Satellite {

  constructor(options) {
    super(options);
    this._nextSatellite = null;
    this._prevSatellite = options.previousItem;
    if (this._prevSatellite) {
      this._prevSatellite._nextSatellite = this;
    }

    this.lastZoneX = 0;
    this.lastZoneY = 0;
    this.key = options.key;
    this.index = options.index;
  }

  update(options) {
    this._prevSatellite = options.previousItem;
    if (this._prevSatellite) {
      this._prevSatellite._nextSatellite = this;
    }

    this.key = options.key;
    this.index = options.index;
  }

  didShift() {
    const zones = this.getZones();
    const xChange = zones.x - this.lastZoneX;
    const yChange = zones.y - this.lastZoneY;

    this.lastZoneX = zones.x;
    this.lastZoneY = zones.y;

    if (xChange || yChange) {
      this.zonesDidChange(xChange, yChange, zones);
    }
  }

  zonesDidChange(/*dX, dY, zones*/) {}

  next() {
    return this._nextSatellite || null;
  }

  prev() {
    return this._prevSatellite || null;
  }

  destroy() {
    super.destroy();
    if (this._nextSatellite) {
      this._nextSatellite._prevSatellite = this._prevSatellite;
    }
    if (this._prevSatellite) {
      this._prevSatellite._nextSatellite = this._nextSatellite;
    }
    this._nextSatellite = null;
    this._prevSatellite = null;
  }

}
