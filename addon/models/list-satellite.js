import Satellite from './satellite';

export default class ListSatellite extends Satellite {

  constructor(component, list) {
    super(component);
    this.list = list;
  }

  heightDidChange(dX) {
    this.list._adjust(this, { dX, dY: 0 });
  }

  next() {
    const nextComponent = this.component.next();

    return nextComponent ? nextComponent.satellite : null;
  }

  prev() {
    const prevComponent = this.component.prev();

    return prevComponent ? prevComponent.satellite : null;
  }

  destroy() {
    if (this.component.unregisterSatellite) {
      this.component.unregisterSatellite();
    }
    this.component = null;
    this.satellite = null;
    this.element = null;
    this.geography.destroy();
    this.geography = null;
    this.list = null;
  }

}
