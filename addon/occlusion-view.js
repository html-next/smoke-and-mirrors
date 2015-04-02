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

    if (current || cached) {
      return current || cached;
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

        if (this.element) { return this; }

        if (this.__cachedElement) {
          this.element = this.__cachedElement;
          return this;
        }

        this._didCreateElementWithoutMorph = true;
        this.constructor.renderer.renderTree(this);

        return this;
      },

      __cacheHeight: function () {

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
      }.on('didInsertElement'),

      //prevent element teardown
      __cacheElement: function () {
        if (this._bustcache) { return; }
        var element = this.element;
        if (element) {
          if (element.parentNode) {
            element.parentNode.removeChild(element);
          }
          this.__cachedElement = element;
          this.set('element', null);
        }
      }.on('willDestroyElement'),


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

  show: function () {

    var instance = this._childViews[0];

    //ensure a view is constructed
    if (!instance) {
      instance = this.get('_cachedView') || this._prerender();
      this.pushObject(instance);
    }

    //unhide
    instance.set('hidden', false);
    var element = this.get('element');
    element.style.visibility = 'visible';

  },

  hide: function () {
    var instance = this._childViews[0] || this.get('_cachedView');
    if (instance) {
      instance.set('hidden', true);
      var element = this.get('element');
      element.style.visibility = 'hidden';
    }
  },

  cache: function () {
    var instance = this._childViews[0];
    if (instance) {
      this.set('_cachedView', instance);
      this.removeObject(instance);
    } else if (!this.get('_cachedView')) {
      this.set('_cachedView', this._prerender());
    }
  },

  cull: function () {
    var instance = this._childViews[0] || this.get('_cachedView');
    if (instance) {
      this.set('_cachedView', null);
      this.removeObject(instance);
      teardownCachedView.call(instance);
    }
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
