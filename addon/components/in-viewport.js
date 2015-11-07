import Ember from 'ember';
import layout from '../templates/components/in-viewport';
import ViewportMixin from '../mixins/in-viewport';

const {
  Component
  } = Ember;

export default Component.extend(ViewportMixin, {
  layout,
  attributeBindings: ['zoneX:x', 'zoneY:y']
});
