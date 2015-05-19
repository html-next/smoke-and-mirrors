import Ember from "ember";
import CacheableMixin from "../../mixins/cacheable";

const {
  on,
  generateControllerFactory,
  Logger
} = Ember;

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
    //var keyForId = this.get('keyForId'); // TODO: Remove or use

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

      __cacheHeight: on('didInsertElement', function() {

        var parentView = this.get('parentView');
        var height = this.get('tagName') === '' ?  parentView.$().height() : this.$().height();

        if (height !== parentView.get('_height')) {
          parentView.set('_height', height);
          parentView.element.style.minHeight = height + 'px';
        }

      })
    }).create(createArgs);

  },


  /**!
   * Destroy the View/Element
   *
   * Unlike the other methods, this method
   * can be called from any state. It is still not valid
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

    // Teardown the child view
    if (View || (View = this._cachedView)) {
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
  keyForId: null,
  itemController: null,

  preserveContext: false,

  _cachedView: null,

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
    var container = this.get('container');

    var controllerFullName = 'controller:' + itemController;
    var factory = container.lookupFactory(controllerFullName);
    var parentController = this.get('controller');

    // let ember generate controller if needed
    if (factory === undefined) {
      factory = generateControllerFactory(container, itemController, model);

      // inform developer about typo
      Logger.warn('occlusion-collection: can\'t lookup controller by name "' + controllerFullName + '".');
      Logger.warn('occlusion-collection: using ' + factory.toString() + '.');
    }

    return factory.create({
      model: model,
      parentController: parentController,
      target: parentController
    });

  },

  willInsertElement: function() {

    var _height = this.get('_height');
    var defaultHeight = this.get('defaultHeight');
    if (typeof defaultHeight === 'number') {
      defaultHeight += 'px';
    }

    this.element.style.visibility = 'hidden';
    this.element.style.minHeight = _height ? _height + 'px' : defaultHeight;

  }

});
