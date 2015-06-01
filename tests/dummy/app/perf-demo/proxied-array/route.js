import Ember from 'ember';
import getData from '../../lib/get-data';

var TIMEOUT = 0;

export default Ember.Route.extend({

  model: function() {
    var controller = this.controllerFor('perf-demo.proxied-array');
    return getData(controller.get('numRows'));
  },

  afterModel: function() {
    // delay first load just a moment to get your feet wet
    Ember.run.later(this.loadSamples.bind(this), 100);
  },

  loadSamples: function() {

    Ember.run.schedule('afterRender', this, function () {
      var controller = this.controllerFor('perf-demo.proxied-array');
      controller
        .set('model', getData(controller.get('numRows')));
    });

    Ember.run.later(this.loadSamples.bind(this), TIMEOUT);
  },

  actions: {
    adjustTimeout: function(val) {
      console.log('adjusting timeout', val);
      TIMEOUT = val;
    }
  }

});
