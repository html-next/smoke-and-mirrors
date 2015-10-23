import Ember from 'ember';
import RouteCache from './route-cache';
import RouteMeta from './route-meta';

export default Ember.Object.extend({
  url: null,
  path: null,
  name: null,
  route: null,
  title: null,
  params: null,

  meta: null,
  cache: null,

  init() {
    this._super();
    let meta = this.meta || {};
    let cache = this.cache || {};
    this.cache = RouteCache.create(cache);
    this.meta = RouteMeta.create(meta);
  }
});
