import Ember from 'ember';
import layout from '../templates/components/pre-render';
import PreRenderMixin from '../mixins/pre-render';

const {
  Component
  } = Ember;

export default Component.extend(PreRenderMixin, {
  layout
});
