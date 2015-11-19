import Ember from 'ember';
import config from './config/environment';

const Router = Ember.Router.extend({
  location: config.locationType
});

export default Router.map(function() {

  this.route('examples', function() {
    this.route('dbmon');
    this.route('infinite-scroll');
    this.route('flexible-layout');
    this.route('scrollable-body');
    this.route('html-gl');
  });

  this.route('mixins', function() {
    this.route('queues');
    this.route('photo-loader');
    this.route('scroller');
    this.route('in-viewport');
    this.route('occlusion');
    this.route('local-storage');
    this.route('session');
    this.route('extended-router');
    this.route('stack');
    this.route('html-gl');
  });

  this.route('services', function() {
    this.route('in-viewport');
    this.route('photo-loader');
  });

  this.route('available-components', function() {
    this.route('vertical-collection');
    this.route('async-image');
    this.route('pre-render');
    this.route('html-gl');
  });

});
