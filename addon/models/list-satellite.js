import Satellite from './satellite';

export default class ListSatellite extends Satellite {

  constructor(component, list) {
    super(component);
    this.list = list;
  }

  heightDidChange(dX) {
    this.list._adjust(this, { dX: dX, dY: 0 });
  }

  next() {
    let nextComponent = this.component.next();
    return nextComponent ? nextComponent.satellite : null;
  }

  prev() {
    let prevComponent = this.component.prev();
    return prevComponent ? prevComponent.satellite : null;
  }

}
