import Ember from 'ember';
import layout from '../templates/components/occludable-area';

const {
  Component,
  inject
  } = Ember;

export default Component.extend({
  layout,
  hasRendered: false,
  isRendered: false,
  occludeAt: 3,

  satellite: null,
  inViewport: inject.service('in-viewport'),

  didInsertElement() {
    this._super();
    this.get('inViewport').register(this);
  },

  willDestroyElement() {
    this._super();
    this.get('inViewport').unregister(this);
  },

  willDestroy() {
    this._super();
    this.get('inViewport').unregister(this);
  },

  registerSatellite(satellite) {
    this.satellite = satellite;
    satellite.didShift = () => {
      const zones = satellite.radar.getSatelliteZones(satellite);

      this._shouldRender(zones);
    };
  },
  unregisterSatellite() {
    this.satellite.didShift = null;
    this.satellite = null;
  },

  shouldRender: true,
  _shouldRender(zones) {
    const zoneX = zones.x;
    const zoneY = zones.y;
    const occludeAt = this.get('occludeAt');
    let willRender;

    if (zoneX > (-1 * occludeAt) && zoneX < occludeAt) {
      willRender = (zoneY > (-1 * occludeAt) && zoneY < occludeAt);
    }

    if (!willRender && !this.hasRendered && zoneX < 0 || zoneY < 0) {
      this.hasRendered = true;
      this.set('shouldRender', true);
      return;
    }

    if (!willRender) {
      if (this.isRendered) {
        this.element.style.height = `${this.satellite.geography.height}px`;
        this.element.style.width = `${this.satellite.geography.width}px`;
        this.isRendered = false;
      }
    } else if (!this.isRendered) {
      this.element.style.height = '';
      this.element.style.width = '';
      this.isRendered = true;
    }

    this.set('shouldRender', willRender);
  }

});
