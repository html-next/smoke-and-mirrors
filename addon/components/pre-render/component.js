import Ember from 'ember';
import layout from './template';
import PreRenderMixin from '../../mixins/pre-render';

const {
  Component
  } = Ember;

export default Component.extend(PreRenderMixin, {
  layout
});
