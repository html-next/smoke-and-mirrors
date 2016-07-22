import Radar from './radar';
import ListSatellite from './list-satellite';

export default class ListRadar extends Radar {

  register(component) {
    this.satellites.push(new ListSatellite(component, this));
  }

  _resize() {
    for (let i = 0; i < this.satellites.length; i++) {
      let satellite = this.satellites[i];
      const change = satellite.resize();

      if (change) {
        ListRadar.adjustSatelliteList(satellite, change);
      }
    }
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
