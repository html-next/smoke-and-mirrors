import Ember from 'ember';

const {
  Mixin,
  inject
  } = Ember;

export default Mixin.create({
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
