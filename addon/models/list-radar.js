import Radar from './radar';
import VirtualItem from '../models/virtual-item';
import TweenLite from 'tweenlite';

export default class ListRadar extends Radar {

  register(options) {
    options.radar = this;
    const satellite = new VirtualItem(options);
    this.satellites.push(satellite);
    return satellite;
  }

  getSatelliteByKey(key) {
    for (let i = 0; i < this.satellites.length; i++) {
      if (this.satellites[i].key === key) {
        return this.satellites[i];
      }
    }
    return false;
  }

  scrollToKey(key, jumpTo) {
    if (!this.scrollContainer) {
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
            radar.scrollY = radar.scrollContainer.scrollTop = Math.round(tweenData.scrollTop);
            radar.scrollX = radar.scrollContainer.scrollLeft = Math.round(tweenData.scrollLeft);
          }
        });
      return this.tween;
    }
    return false;
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
