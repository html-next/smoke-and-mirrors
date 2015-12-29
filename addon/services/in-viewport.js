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

  _activateRadar() {
    const resizeDebounce = this.get('resizeDebounce');
    const minimumMovement = this.get('minimumMovement');

    this.radar = new Radar({
      sky: document.body,
      telescope: window,
      minimumMovement,
      resizeDebounce
    });
  },

  willDestroy() {
    this._super(...arguments);
    this.radar.destroy();
    this.radar = null;
  },

  init() {
    this._super(...arguments);
    this._activateRadar();
  }

});
