import Ember from 'ember';
import layout from './template';

const {
  Component,
  inject
  } = Ember;

export default Component.extend({
  layout,
  attributeBindings: ['zoneX:x', 'zoneY:y'],

  inViewport: inject.service('in-viewport'),

  zoneX: 0,
  zoneY: 0,

  didInsertElement() {
    this._super(...arguments);
    this.get('inViewport').register(this);
  },

  willDestroyElement() {
    this._super(...arguments);
    this.get('inViewport').unregister(this);
  },

  willDestroy() {
    this._super(...arguments);
    this.get('inViewport').unregister(this);
  }
});
