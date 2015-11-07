import Ember from 'ember';
import layout from '../templates/components/occludable-area';
import ViewportMixin from '../mixins/in-viewport';

const {
  Component,
  computed
  } = Ember;

export default Component.extend(ViewportMixin, {
  layout: layout,
  hasRendered: false,
  isRendered: false,
  occludeAt: 2,

  satellite: null,
  registerSatellite(satellite) {
    this.satellite = satellite;
  },
  unregisterSatellite() {
    this.satellite = null;
  },

  shouldRender: computed('zoneX', 'zoneY', function() {
    const zoneX = this.get('zoneX');
    const zoneY = this.get('zoneY');
    const occludeAt = this.get('occludeAt');
    const hasRendered = this.get('hasRendered');
    let willRender;

    if (!hasRendered) {
      this.set('hasRendered', true);
      return true;
    }

    if (zoneX > (-1 * occludeAt) && zoneX < occludeAt) {
      willRender = (zoneY > (-1 * occludeAt) && zoneY < occludeAt);
    }

    if (!willRender) {
      if (this.get('isRendered')) {
        this.element.style.height = this.satellite.geography.height + 'px';
        this.element.style.width = this.satellite.geography.width + 'px';
        this.set('isRendered', false);
      }
    } else {
      if (!this.get('isRendered')) {
        this.element.style.height = '';
        this.element.style.width ='';
        this.set('isRendered', true);
      }
    }

    return willRender;
  })

});
