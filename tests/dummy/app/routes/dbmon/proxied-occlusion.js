import Ember from 'ember';
import getData from 'dummy/lib/get-data';

export default Ember.Route.extend({

  model: function() {
    var controller = this.controllerFor('dbmon.proxied-occlusion');
    return getData(controller.get('numRows'));
  },

  afterModel: function() {
    // delay first load just a moment to get your feet wet
    Ember.run.later(this.loadSamples.bind(this), 100);
  },

  loadSamples: function() {
    var controller = this.controllerFor('dbmon.proxied-occlusion');
    Ember.run.schedule('afterRender', this, function () {
      controller
        .set('model', getData(controller.get('numRows')));
    });
    Ember.run.later(this.loadSamples.bind(this), controller.get('timeout'));
  }

});
