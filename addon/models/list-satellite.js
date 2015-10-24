import Satellite from './satellite';

export default class ListSatellite extends Satellite {

  constructor(component, list) {
    super(component);
    this.list = list;
  }

  heightDidChange(dX) {
    this.list.adjustSatelliteList(this, { dX: dX, dY: 0 });
  }

  next() {
    return this.component.next();
  }

  prev() {
    return this.component.prev();
  }

}
