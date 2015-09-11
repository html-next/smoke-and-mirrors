import Ember from 'ember';
import getData from 'dummy/lib/get-data';

let TIMEOUT = 0;

const {
  Route,
  run
  } = Ember;

export default Route.extend({

  numRows: 100,

  model() {
    return getData(this.get('numRows'));
  },

  afterModel() {
    run.later(this, this.loadSamples, 100);
  },

  loadSamples() {
    run.schedule('afterRender', this, function () {
      this.controller.set('model', getData(this.get('numRows')));
    });
    run.later(this, this.loadSamples, TIMEOUT);
  },

  actions: {

    addRow() {
      this.incrementProperty('numRows');
    },

    removeRow() {
      this.decrementProperty('numRows');
    }

  }

});
