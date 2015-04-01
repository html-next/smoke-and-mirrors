import Ember from 'ember';
import getData from '../lib/get-data';

var TIMEOUT = 0;

export default Ember.Route.extend({
  model: function() {
    return {
      databases: {}
    };
  },

  afterModel: function() {
    this.loadSamples();
  },

  loadSamples: function() {
    var model = this.modelFor('application');
    var newData = getData();
    var databaseArray = [];

    Object.keys(newData.databases).forEach((dbname) => {
      var sampleInfo = newData.databases[dbname];

      if (!model.databases[dbname]) {
        model.databases[dbname] = {
          name: dbname,
          samples: []
        };
      }

      var samples = model.databases[dbname].samples;
      samples.push({
        time: newData.start_at,
        queries: sampleInfo.queries
      });
      if (samples.length > 5) {
        samples.splice(0, samples.length - 5);
      }

      databaseArray.push(model.databases[dbname]);
    });

    Ember.set(model, 'databaseArray', databaseArray);

    setTimeout(this.loadSamples.bind(this), TIMEOUT);
  }
});
