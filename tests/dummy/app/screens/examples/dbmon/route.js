import Ember from 'ember';
import getData from 'dummy/lib/get-data';
import nextFrame from 'smoke-and-mirrors/utils/next-frame';
let TIMEOUT = 0;

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
    nextFrame(this, this.loadSamples);
    //run.later(this, this.loadSamples, TIMEOUT);
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
