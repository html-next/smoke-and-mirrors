import Ember from 'ember';
import config from './config/environment';

var Router = Ember.Router.extend({
  location: config.locationType
});

export default Router.map(function() {
  this.route('examples', function() {
    this.route('dbmon');
    this.route('infinite-scroll');
    this.route('flexible-layout');
  });
  this.route('features', function() {

  });
  this.route('available-components', function() {

  });
});
