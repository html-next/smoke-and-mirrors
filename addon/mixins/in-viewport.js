import Ember from 'ember';

const {
  Mixin,
  inject
  } = Ember;

export default Mixin.create({
  viewport: inject.service('in-viewport'),
  _position: null,

  didInsertElement() {
    this._super(...arguments);
    this.get('viewport').register(this);
  },

  willDestroyElement() {
    this._super(...arguments);
    this.get('viewport').unregister(this);
  }

});
