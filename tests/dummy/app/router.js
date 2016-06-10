import Ember from 'ember';
import config from './config/environment';

const Router = Ember.Router.extend({
  location: config.locationType
});

Router.map(function() {
  // neat demos
  /*
  this.route('demos', { path: 'examples' }, function() {
    this.route('dbmon');
    this.route('infinite-scroll');
    this.route('flexible-layout');
    this.route('scrollable-body');
    this.route('html-gl');
    this.route('large-grid');
    this.route('reduce-debug');
  });

  // tutorials
  this.route('guides');

  // documentation
  this.route('docs', function() {

    this.route('services', function() {
      this.route('in-viewport');
      this.route('photo-loader');
    });

    this.route('available-components', function() {
      this.route('vertical-collection');
      this.route('pre-render');
    });

  });

  // routes for acceptance tests
  this.route('tests', function() {
    this.route('scroll-position');
  });

  // all routes
  this.route('site-index');

  // 404 handling
  this.route('unicorn', { path: '*path' });
  this.route('faq');
  */
});

export default Router;
