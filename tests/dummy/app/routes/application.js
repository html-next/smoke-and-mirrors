import Ember from 'ember';
import getData from '../lib/get-data';

var TIMEOUT = 0;

export default Ember.Route.extend({
  model: function() {
    return getData();
  },

  afterModel: function() {
    Ember.run.later(this.loadSamples.bind(this), TIMEOUT);
  },

  loadSamples: function() {

    Ember.run.schedule('afterRender', this, function () {
      this.controllerFor('application')
        .set('model', getData());
    });

    Ember.run.later(this.loadSamples.bind(this), TIMEOUT);
  }
});
