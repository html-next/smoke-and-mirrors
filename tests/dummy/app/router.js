import Ember from 'ember';
import config from './config/environment';

var Router = Ember.Router.extend({
  location: config.locationType
});

export default Router.map(function() {
  this.route('dbmon', function() {
    this.route('naive');
    this.route('occlusion');
    this.route('proxied');
    this.route('proxied-occlusion');
  });
  this.route('features', function() {

  });
  this.route('available-components', function() {

  });
});
