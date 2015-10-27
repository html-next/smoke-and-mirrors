import Ember from 'ember';
import layout from './template';

const {
  Component,
  computed
  } = Ember;

export default Component.extend({
  tagName: 'number-slide',
  layout: layout,
  index: 0,
  number: 0
});
