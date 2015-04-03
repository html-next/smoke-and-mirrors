import Ember from "ember";
window.CachedViews = window.CachedViews || {};
var CachedViews = window.CachedViews;


function teardownCachedView() {

  //allow view teardown
  this.set('_bustcache', true);

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




/**
 An occlusion view is one that intelligently removes
 its content when scrolled off the screen.

 @class OcclusionView
 @extends Ember.View
 @namespace Ember
 **/
export default Ember.ContainerView.extend({

  _prerender: function () {

    var current = this._childViews[0];
    var cached = this.get('_cachedView');

    // don't do anything, use the current view
    if (current) { return current; }

    // use the cached view if possible
    if (cached) {
      if (this._rehydrateFromView(cached)) {
        return cached;
      } else {
        //TODO reuse view, and only rerender DOM
        this.set('_cachedView', null);
        teardownCachedView.call(cached);
      }
    }

    var content = this.get('content');
    var controller = this.getControllerFor();
    var container = this.get('container');
    var viewFullName = 'view:' + this.get('innerView');
    var viewFactory = container.lookupFactory(viewFullName);
    var keyForView = this.get('keyForView');

    var view = viewFactory.extend({
      content: content,
      controller: controller,

      attributeBindings: ['hidden'],
      hidden: true,

      __keyForView : keyForView,

      //rehydrate view
      createElement: function() {

        console.log('Create Element', this.get('element'), this.get('__cachedElement'));

        if (this.get('element')) { return this; }

        if (this.get('__cachedElement')) {
          console.log('using cached element');
          this.element = this.get('__cachedElement');
          return this;
        }

        console.log('creating new element');
        this._didCreateElementWithoutMorph = true;
        this.constructor.renderer.renderTree(this);

        return this;
      },

      __cacheHeight: Ember.on('didInsertElement', function () {

        var parentView = this.get('parentView');

        if (!parentView.get('_height')) {

          if (this.get('tagName') === '') {
            var height = parentView.$().height();
            parentView.set('_height', height);
            Ember.run.schedule('afterRender', parentView, function() {
              this.element.style.height = height + 'px';
            });
          } else {
            var height = this.$().height();
            parentView.set('_height', height);
            Ember.run.schedule('afterRender', parentView, function() {
              this.element.style.height = height + 'px';
            });
          }

        }
      }),

      //prevent element teardown
      __cacheElement: Ember.on('willDestroyElement', function () {

        if (this.get('_bustcache')) { return; }

        var element = this.get('element');
        if (element) {
          this.set('__cachedElement', element);
        }
      }),


      //prevent view destruction
      _bustcache: false,

      destroy: function () {
        if (this.get('_bustcache')) {
          this._super();
        }
      }
    }).create();
    return view;
  },

  _rehydrateFromView: function(view) {

    var parentNode = this.get('element');
    var child = view.get('__cachedElement');
    if (!child) {
      return false;
    }
    parentNode.appendChild(child);
    return true;
  },

  viewState: 'unknown',

  show: function () {

    //don't do unnecessary work
    if (this.get('viewState') === 'visible') { return; }

    var instance = this._childViews[0];

    //ensure a view is constructed
    if (!instance && (instance = this._prerender())) {
      this.pushObject(instance);
    }

    //unhide
    console.log('showing', instance);
    instance.set('hidden', null);
    var element = this.get('element');
    element.style.visibility = 'visible';

    this.set('viewState', 'visible');

  },

  hide: function () {

    //don't do unnecessary work
    if (this.get('viewState') === 'hidden') { return; }

    var instance = this._childViews[0];
    var element = this.get('element');

    // insert a cached instance
    if (!instance && (instance = this._prerender())) {

      // ensure we're hidden before insertion
      console.log('inserting hidden cached view');
      instance.set('hidden', true);
      element.style.visibility = 'hidden';
      this.set('viewState', 'hidden');

      // insert
      this.pushObject(instance);


    // ensure we're hidden if we have an instance
    } else if (instance && !instance.get('hidden')) {
      console.log('hiding', instance);
      instance.set('hidden', true);
      element.style.visibility = 'hidden';
      this.set('viewState', 'hidden');
    }

  },

  cache: function () {

    //don't do unnecessary work
    if (this.get('viewState') === 'cached') { return; }

    var instance = this._childViews[0];
    var element = this.get('element');

    // cache the existing instance as it leaves the viewable area
    if (instance) {
      console.log('caching', instance);
      this.set('_cachedView', instance);
      this.removeObject(instance);

    // generate a new view instance to use next time
    } else {

      instance = this._prerender();
      console.log('pre-caching', instance);
      this.set('_cachedView', instance);

    }

    // ensure we're hidden too
    if (instance && !instance.get('hidden')) {
      instance.set('hidden', true);
      element.style.visibility = 'hidden';
      this.set('viewState', 'cached');
    }

  },

  cull: function () {

    // don't do unnecessary work
    if (this.get('viewState') === 'culled') { return; }

    var instance = this._childViews[0];// || this.get('_cachedView');
    var element = this.get('element');

    // ensure hidden before teardown
    element.style.visibility = 'hidden';

    // remove instance from dom
    if (instance) {

      console.log('culling existing instance');

      this.removeObject(instance);
      teardownCachedView.call(instance);

    // remove cached instance if applicable
    } else if ((instance = this.get('_cachedView'))) {
        console.log('culling cached instance');
        teardownCachedView.call(instance);
    }


    // null out
    this.set('_cachedView', null);
    this.set('viewState', 'culled');

  },

  willDestroy : function () {
    this.cull();
  },

  innerView: '', //passed in
  defaultHeight: 75,
  keyForView: null, //keyForView
  itemController: null,

  _cachedView: null,

  //TODO alwaysUseDefaultHeight for performance gain when using regular lists
  //TODO enable height cacheing
  _height: 0,

  getControllerFor: function () {
    var itemController = this.get('itemController');

    if (!itemController) {
      return this.get('parentView.controller');
    }

    if (typeof itemController !==  'string') {
      return itemController;
    }

    // Wire up the itemController
    var model = this.get('content');
    var controller = null;
    var container = this.get('container');

    var controllerFullName = 'controller:' + itemController,
      factory = container.lookupFactory(controllerFullName),
      parentController = this.get('controller');

    // let ember generate controller if needed
    if (factory === undefined) {
      factory = Ember.generateControllerFactory(container, itemController, model);

      // inform developer about typo
      Ember.Logger.warn('ember-cloaking: can\'t lookup controller by name "' + controllerFullName + '".');
      Ember.Logger.warn('ember-cloaking: using ' + factory.toString() + '.');
    }

    return factory.create({
      model: model,
      parentController: parentController,
      target: parentController
    });

  },

  willInsertElement: function() {
    this.get('element').style.height = (this.get('_height') || this.get('defaultHeight')) + 'px';
  }

});
