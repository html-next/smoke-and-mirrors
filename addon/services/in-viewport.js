import Ember from 'ember';
import Radar from '../models/radar';

const {
  Service
  } = Ember;

export default Service.extend({

  radar: null,
  minimumMovement: 15,
  resizeDebounce: 64,

  register(component) {
    this.radar.register(component);
  },

  unregister(component) {
    this.radar.unregister(component);
  },

  updateZones() {
    /*
      This is needed until computed properties will
      work with ES6 classes.
     */
    this.radar.satellites.forEach((satellite) => {
      const zones = this.radar.getSatelliteZones(satellite);
      satellite.component.setProperties({
        zoneX: zones.x,
        zoneY: zones.y
      });
    });
  },

  updater: null,
  _activateRadar() {
    const resizeDebounce = this.get('resizeDebounce');
    const minimumMovement = this.get('minimumMovement');
    this.radar = new Radar({
      sky: document.body,
      telescope: window,
      minimumMovement: minimumMovement,
      resizeDebounce: resizeDebounce
    });

    this.updater = this.updateZones.bind(this);

    this.radar.didShiftSatellites = this.updater;
    this.radar.didResizeSatellites = this.updater;
  },

  willDestroy() {
    this._super(...arguments);
    this.radar.destroy();
    this.updater = null;
  },

  init() {
    this._super(...arguments);
    this._activateRadar();
  }

});
