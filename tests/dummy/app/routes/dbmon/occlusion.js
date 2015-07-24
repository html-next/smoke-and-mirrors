import Ember from 'ember';
import getData from 'dummy/lib/get-data';

var TIMEOUT = 0;

export default Ember.Route.extend({
  model: function() {
    var controller = this.controllerFor('dbmon.occlusion');
    return getData(controller.get('numRows'));
  },

  afterModel: function() {
    Ember.run.later(this.loadSamples.bind(this), 100);
  },

  loadSamples: function() {

    Ember.run.schedule('afterRender', this, function () {
      var controller = this.controllerFor('dbmon.occlusion');
      controller
        .set('model', getData(controller.get('numRows')));
    });

    Ember.run.later(this.loadSamples.bind(this), TIMEOUT);
  }
});
