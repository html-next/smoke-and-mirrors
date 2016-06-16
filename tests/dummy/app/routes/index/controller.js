import Ember from 'ember';

const {
  A,
  computed,
  Controller
  } = Ember;

export default Controller.extend({

  hasData: false,
  showEdges: false,

  values: computed('hasData', function() {
    return this.get('hasData') ? this.get('model') : new A([]);
  }),

  actions: {
    toggleData() {
      this.toggleProperty('hasData');
    },

    toggleEdges() {
      this.toggleProperty('showEdges');
    }
  }

});
