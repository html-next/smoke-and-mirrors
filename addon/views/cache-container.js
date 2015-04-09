import Ember from "ember";
import CacheableMixin from "../mixins/cacheable";

window.CachedViews = window.CachedViews || {};
var CachedViews = window.CachedViews;

/**!
 * Destroy the View/Element
 */
function teardownCachedView() {

  //allow view teardown
  this._bustcache = true;

  //remove from global cache
  delete CachedViews[this.elementId];

  //remove reference from controller
  if (this.__keyForId) {
    var viewCache = this.get('controller.__view');
    if (viewCache && viewCache.hasOwnProperty(this.__keyForId)) {
      delete viewCache[this.__keyForId];
    }
  } else {
    this.set('controller.__view', null);
  }

  //teardown the view
  this.destroy();

}

export default Ember.ContainerView.extend({

  tagName : 'cache-container',

  cacheExpires : 900000, //15min

  keyForId : null,

  willDestroy : function () {
    var instance = this.get('currentView');
    var expires = this.get('cacheExpires');

    CachedViews[instance.elementId] = instance;
    if (expires) {
      instance.set('__cacheTimeout', Ember.run.later(instance, teardownCachedView, expires));
    }
    this._super();
  },

  view : null,

  init : function () {

    var keyForId = this.keyForId;

    //get cached view
    var CachedView = this.get('controller.__view');
    if (keyForId && CachedView) {
      CachedView = CachedView[keyForId];
    }

    if (CachedView) {

      if (this.get('cacheExpires')) {
        Ember.run.cancel(CachedView.get('__cacheTimeout'));
      }
      this.set('currentView', CachedView);

      //create normal view
    } else {

      var instance = this.get('view')
        .extend(CacheableMixin)
        .create({
          controller : this.get('controller')
        });

      if (this.keyForId) {
        var cache = this.get('controller.__view');
        if (!cache) {
          cache = {};
          this.set('controller.__view', cache);
        }
        cache[this.get(this.keyForId)] = instance;
      } else {
        this.set('controller.__view', instance);
      }
      this.set('currentView', instance);
    }

    return this._super();

  }

});
