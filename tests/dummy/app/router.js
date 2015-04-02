import Ember from 'ember';
import config from './config/environment';

var Router = Ember.Router.extend({
  location: config.locationType
});

export default Router.map(function() {
  this.route('dbmon-naive');
  this.route('dbmon-proxied-each');
  this.route('dbmon-occlusion-collection');
  this.route('infinite-scroll');
  this.route('cacheing-view');
});
