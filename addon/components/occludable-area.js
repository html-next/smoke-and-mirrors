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
  occludeAt: 2,
  shouldRender: computed('zoneX', 'zoneY', function() {
    const zoneX = this.get('zoneX');
    const zoneY = this.get('zoneY');
    const occludeAt = this.get('occludeAt');
    const hasRendered = this.get('hasRendered');

    if (!hasRendered) {
      this.set('hasRendered', true);
      return true;
    }

    if (zoneX > (-1 * occludeAt) && zoneX < occludeAt) {
      return (zoneY > (-1 * occludeAt) && zoneY < occludeAt);
    }

  })

});
