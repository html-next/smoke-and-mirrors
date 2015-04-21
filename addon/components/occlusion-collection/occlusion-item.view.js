import Ember from "ember";
import CacheableMixin from "../../mixins/cacheable";

const STATE_LIST = ['culled', 'cached', 'hidden', 'visible'];

const STATE_TRANSITIONS_UP = [
  { state: 'culled', method: '' },
  { state: 'cached', method: '_ov_prepare' },
  { state: 'hidden', method: '_ov_insert' },
  { state: 'visible', method: '_ov_reveal' }
];

const STATE_TRANSITIONS_DOWN = [
  { state: 'visible', method: '' },
  { state: 'hidden', method: '_ov_obscure' },
  { state: 'cached', method: '_ov_remove' },
  { state: 'culled', method: '_ov_teardown' }
];

/**
 An occlusion view is one that intelligently removes
 its content when scrolled off the screen.

 @class OcclusionView
 @extends Ember.View
 @namespace Ember
 **/
export default Ember.ContainerView.extend({

  classNameBindings: ['viewStateClass'],
  viewState: 'culled',

  viewStateClass: function() {
    return 'state-' + this.get('viewState');
  }.property('viewState'),

  show: function () {
    this._setState('visible');
  },

  hide: function () {
    this._setState('hidden');
  },

  cache: function () {
    this._setState('cached');
  },

  cull: function () {
    this._setState('culled');
  },

  willDestroy : function () {
    this._ov_teardown();
    this.set('viewState', 'culled');
  },

  _setState: function (toState) {

    var fromState = this.get('viewState');
    var currentState = fromState;

    if (fromState === toState) {
      return;
    }

    var transitionMap = STATE_LIST.indexOf(fromState) < STATE_LIST.indexOf(toState) ? STATE_TRANSITIONS_UP : STATE_TRANSITIONS_DOWN;
    var i;

    for (i = 0; i < transitionMap.length; i++) {
      if (transitionMap[i].state === fromState) {
        break;
      }
    }
    i++;

    while (transitionMap[i] && currentState !== toState) {
      if (transitionMap[i].method) {
        this[transitionMap[i].method]();
        currentState = transitionMap[i].state;
      }
      i++;
    }

    this.set('viewState', toState);
  },

  /**!
   * Stage the View/Element for use
   *
   * @private
   */
  _ov_prepare: function() {

    if (this._childViews[0]) {
      throw "Attempted to prepare a View when one already existed.";
    }

    if (this._cachedView) {
      throw "Attempted to prepare a View when a cached one already existed.";
    }

    var content = this.get('content');
    var controller = this.getControllerFor();
    var container = this.get('container');
    var viewFullName = 'view:' + this.get('innerView');
    var viewFactory = container.lookupFactory(viewFullName);
    var keyForId = this.get('keyForId');

    var createArgs = {};

    if (this.get('preserveContext')) {
      createArgs.context = controller || content;
    } else {
      createArgs.content = controller || content;
    }

    if (controller) {
      createArgs.controller = controller;
    }

    this._cachedView = viewFactory.extend(CacheableMixin, {

      attributeBindings: ['hidden'],
      hidden: true,

      __cacheHeight: Ember.on('didInsertElement', function() {

        var parentView = this.get('parentView');

        if (!parentView.get('_height')) {

          if (this.get('tagName') === '') {
            var height = parentView.$().height() + 'px';
            parentView.set('_height', height);
            Ember.run.schedule('render', parentView, function() {
              if (this.element) {
                this.element.style.height = height;
              }
            });
          } else {
            var height = this.$().height() + 'px';
            parentView.set('_height', height);
            Ember.run.schedule('render', parentView, function() {
              if (this.element) {
                this.element.style.height = height;
              }
            });
          }

        }
      })
    }).create(createArgs);

  },


  /**!
   * Destroy the View/Element
   *
   * Unlike the other methods, this method
   * can be called from any state. It is stil not valid
   * to transition to it directly, but willDestroy uses it
   * to teardown the instance.
   *
   * @private
   */
  _ov_teardown: function() {

    var View = this._childViews[0];

    // remove instance from dom
    if (View) {
      this.removeObject(View);
    }

    if (View || (View = this._cachedView)) {
      // Teardown the child view
      View.set('_bustCache', true);
      View.destroy();
    }

    // null out
    this._cachedView = null;

  },


  /**!
   * Remove the Element from the DOM
   *
   * @private
   */
  _ov_remove: function() {

    var View = this._childViews[0];
    this._cachedView = View;
    this.removeObject(View);

  },


  /**!
   * Insert the Element into the DOM in a hidden state.
   *
   * @private
   */
  _ov_insert: function() {

    var View = this._cachedView;
    var parentNode = this.get('element');
    var child = View.get('__cachedElement');

    Ember.assert("A Cached View Exists", View);
    //Ember.assert("The View Has A Cached Element", child);

    if (child) {
      parentNode.appendChild(child);
    }
    this.pushObject(View);
    this._cachedView = null;

  },


  /**!
   * Reveal the Element
   *
   * @private
   */
  _ov_reveal: function() {

    var instance = this._childViews[0];
    var element = this.element;
    instance.set('hidden', false);
    element.style.visibility = 'visible';

  },


  /**!
   * Hide the Element
   *
   * @private
   */
  _ov_obscure: function() {

    var instance = this._childViews[0];
    var element = this.get('element');
    instance.set('hidden', true);
    element.style.visibility = 'hidden';

  },


  innerView: '', //passed in
  defaultHeight: 75,
  keyForId: null, //keyForId
  itemController: null,

  preserveContext: false,

  _cachedView: null,

  //TODO alwaysUseDefaultHeight for performance gain when using regular lists
  //TODO enable height cacheing
  _height: 0,

  getControllerFor: function () {
    var itemController = this.get('itemController');

    if (!itemController) {
      return false;
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
      Ember.Logger.warn('occlusion-collection: can\'t lookup controller by name "' + controllerFullName + '".');
      Ember.Logger.warn('occlusion-collection: using ' + factory.toString() + '.');
    }

    return factory.create({
      model: model,
      parentController: parentController,
      target: parentController
    });

  },

  willInsertElement: function() {
    this.element.style.visibility = 'hidden';
    this.element.style.height = (this.get('_height') || this.get('defaultHeight')) + 'px';
  }

});
