import Radar from './radar';
import ListSatellite from './list-satellite';
import Ember from 'ember';

const {
  guidFor
  } = Ember;

export default class ListRadar extends Radar {

  register(component) {
    let sat = ListSatellite.create({
      component,
      dimensions: undefined,
      element: component.element,
      key: guidFor(component),
      radar: this,
      scalar: undefined
    }, this);

    this._push(sat);

    return sat;
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
