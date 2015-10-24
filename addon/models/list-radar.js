import Radar from './radar';
import ListSatellite from './list-satellite';

export default class ListRadar extends Radar {

  register(component) {
    this.satellites.push(new ListSatellite(component, this));
  }

  _resize() {
    this.satellites.forEach((c) => {
      let change = c.resize();
      if (change) {
        this.adjustSatelliteList(c, change);
      }
    });
  }

  static adjustSatelliteList(satellite, change) {
    while (satellite = satellite.next()) {
      satellite.shift(change.dY, change.dX);
    }
  }

}
