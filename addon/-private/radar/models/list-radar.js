import Radar from './radar';
import VirtualItem from './virtual-item';
import TweenLite from 'tweenlite';

export default class ListRadar extends Radar {

  register(options) {
    options.radar = this;
    options.previousItem = this.length ? this.satellites[this.length - 1] : undefined;

    const satellite = new VirtualItem(options);

    this._push(satellite);
    return satellite;
  }

  unregister(component) {
    const key = guidFor(component);

    if (!this.satellites) {
      return;
    }

    const satellite = this.satellites.find((sat) => {
      return sat.key === key;
    });

    if (satellite) {
      const index = this.satellites.indexOf(satellite);

      this.satellites.splice(index, 1);
      satellite.destroy();
    }
  }

  getSatelliteByKey(key) {
    for (let i = 0; i < this.length; i++) {
      if (this.satellites[i].key === key) {
        return this.satellites[i];
      }
    }
    return false;
  }

  scrollToKey(key, jumpTo) {
    if (!this.telescope) {
      return false;
    }
    this.killTween();
    const satellite = this.getSatelliteByKey(key);
    if (satellite) {
      if (jumpTo) {
        this.setScrollState(satellite.geography.top, satellite.geography.left);
        return true;
      }

      const tweenData = {
        scrollTop: this.scrollY || 0,
        scrollLeft: this.scrollX || 0
      };
      const radar = this;
      this.tween = TweenLite.to(
        tweenData,
        0.35,
        {
          scrollTop: satellite.geography.top,
          scrollLeft: satellite.geography.left,
          onUpdate() {
            radar.setScrollState(tweenData.scrollTop, tweenData.scrollLeft);
          }
        });
      return this.tween;
    }
    return false;
  }

  _resize() {
    for (let i = 0; i < this.length; i++) {
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
