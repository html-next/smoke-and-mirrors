import Ember from 'ember';
import getData from 'dummy/lib/get-data';

const {
  Route,
  run
  } = Ember;

export default Route.extend({

  numRows: 100,

  model() {
    return getData(this.numRows);
  },

  afterModel() {
    run.later(this, this.loadSamples, 100);
  },

  loadSamples() {
    this.controller.set('model', getData(this.numRows));
    run.next(this, this.loadSamples);
  },

  actions: {

    addRow() {
      this.numRows++;
    },

    removeRow() {
      this.numRows--;
    }

  }

});
