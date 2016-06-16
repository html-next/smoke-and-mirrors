import Ember from 'ember';
import getData from 'dummy/lib/get-data';

const {
  Route,
  run
  } = Ember;

export default Route.extend({

  numRows: 100,
  _nextLoad: null,

  model() {
    return getData(this.numRows);
  },

  afterModel() {
    run.later(this, this.loadSamples, 100);
  },

  loadSamples() {
    this.controller.set('model', getData(this.numRows));
    this._nextLoad = run.next(this, this.loadSamples);
  },

  actions: {

    addRow() {
      this.numRows++;
    },

    removeRow() {
      this.numRows--;
    },

    willTransition() {
      run.cancel(this._nextLoad);
      this.controller.set('model', null);
    }

  }

});
