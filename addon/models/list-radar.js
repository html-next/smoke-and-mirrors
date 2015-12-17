import Radar from './radar';
import VirtualItem from '../models/virtual-item';

export default class ListRadar extends Radar {

  register(options) {
    options.radar = this;
    const satellite = new VirtualItem(options);
    this.satellites.push(satellite);
    return satellite;
  }

  _resize() {
    this.satellites.forEach((c) => {
      const change = c.resize();

      if (change) {
        ListRadar.adjustSatelliteList(c, change);
      }
    });
  }

  _adjust(satellite, change) {
    ListRadar.adjustSatelliteList(satellite, change);
  }

  static adjustSatelliteList(satellite, change) {
    while (satellite = satellite.next()) {
      satellite.shift(change.dY, change.dX);
    }
  }

}
