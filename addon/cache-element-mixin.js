import Ember from "ember";
window.CachedViews = window.CachedViews || {};
var CachedViews = window.CachedViews;

function teardownCachedView() {

  //allow view teardown
  this._bustcache = true;

  //remove from global cache
  delete CachedViews[this.elementId];

  //remove reference from controller
  if (this.__keyForView) {
    var viewCache = this.get('controller.__view');
    if (viewCache && viewCache.hasOwnProperty(this.__keyForView)) {
      delete viewCache[this.__keyForView];
    }
  } else {
    this.set('controller.__view', null);
  }

  //teardown the view
  this.destroy();

}

export default Ember.Mixin.create({

  cacheExpires : 900000, //15min

  keyForView : null,

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

    var keyForView = this.keyForView;

    //get cached view
    var CachedView = this.get('controller.__view');
    if (keyForView && CachedView) {
      CachedView = CachedView[keyForView];
    }

    if (CachedView) {

      if (this.get('cacheExpires')) {
        Ember.run.cancel(CachedView.get('__cacheTimeout'));
      }
      this.set('currentView', CachedView);

      //create normal view
    } else {
      var instance = this.get('view')
        .extend({

          __keyForView : keyForView,

          //rehydrate view
          createElement: function() {
            if (this.__cachedElement) {
              this.element = this.__cachedElement;
              return this;
            }
            return this._super();
          },

          //prevent element teardown
          __cacheElement : function () {
            if (this._bustcache) { return; }
            var element = this.element;
            if (element) {
              element.parentNode.removeChild(element);
              this.__cachedElement = element;
              this.set('element', null);
            }
          }.on('willDestroyElement'),

          //prevent view destruction
          _bustcache : false,
          willDestroy : function () { if (this._bustcache) { this._super(); }},
          destroy : function () { if (this._bustcache) { this._super(); }}

        })
        .create({
          controller : this.get('controller')
        });

      if (this.keyForView) {
        var cache = this.get('controller.__view');
        if (!cache) {
          cache = {};
          this.set('controller.__view', cache);
        }
        cache[this.get(this.keyForView)] = instance;
      } else {
        this.set('controller.__view', instance);
      }
      this.set('currentView', instance);
    }

    return this._super();

  }

});
