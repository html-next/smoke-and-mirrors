import Ember from "ember";

const {
  computed,
  run
} = Ember;

const STATE_LIST = ['culled', 'hidden', 'visible'];

const STATE_TRANSITIONS_UP = [
  { state: 'culled', method: '' },
  { state: 'hidden', method: '_ov_insert' },
  { state: 'visible', method: '_ov_reveal' }
];

const STATE_TRANSITIONS_DOWN = [
  { state: 'visible', method: '' },
  { state: 'hidden', method: '_ov_obscure' },
  { state: 'culled', method: '_ov_teardown' }
];

/**
 An occlusion view is one that intelligently removes
 its content when scrolled off the screen.

 @class OcclusionView
 @extends Ember.View
 @namespace Ember
 **/
export default Ember.Component.extend({

  tagName: 'occlusion-item',

  classNameBindings: ['viewStateClass'],
  viewState: 'culled',
  contentVisible: false,
  contentHidden: false,
  contentInserted: false,
  contentCulled: false,
  collection: null,

  viewStateClass: computed('viewState', function() {
    return 'state-' + this.get('viewState');
  }),

  show: function () {
    this._setState('visible');
  },

  hide: function () {
    this._setState('hidden');
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
    this.setProperties({ contentCulled: true, contentHidden: false, contentInserted: false });
  },


  /**!
   * Insert the Element into the DOM in a hidden state.
   *
   * @private
   */
  _ov_insert: function() {
    this.setProperties({ contentHidden: true, contentCulled: false, contentInserted: true });
    if (!this.get('_height')) {
      run.schedule('afterRender', this, function() {
        if (!this.get('isDestroyed')) {
          var height = this.$().height();
          this.set('_height', height);
          this.element.style.height = height + 'px';
        }
      });
    }
  },


  /**!
   * Reveal the Element
   *
   * @private
   */
  _ov_reveal: function() {
    this.setProperties({ contentHidden: false, contentVisible: true, contentInserted: true });
    this.element.style.visibility = 'visible';
  },


  /**!
   * Hide the Element
   *
   * @private
   */
  _ov_obscure: function() {
    this.setProperties({ contentHidden: true, contentVisible: false, contentInserted: true });
    this.element.style.visibility = 'hidden';
  },

  defaultHeight: 75,
  keyForId: null,

  _height: 0,

  willInsertElement: function() {

    var _height = this.get('_height');
    var defaultHeight = this.get('defaultHeight');
    if (typeof defaultHeight === 'number') {
      defaultHeight += 'px';
    }

    this.element.style.visibility = 'hidden';
    this.element.style.minHeight = _height ? _height + 'px' : defaultHeight;

  },

  didReceiveAttrs: function(attrs) {
    var key = this.get('keyForId');
    var oldKeyVal = attrs.oldAttrs ? attrs.oldAttrs.content.value[key] : false;
    var newKeyVal = attrs.newAttrs.content.value[key];
    if (oldKeyVal && oldKeyVal !== newKeyVal) {
      this.collection.unregister(oldKeyVal);
      this.collection.register(this, newKeyVal);
    }
  },
  willDestroy: function() {
    var key = this.get('keyForId');
    var val = this.get('content.' + key);
    this.collection.unregister(val);
  },

  init: function() {
    var val = this.get('content.' + this.get('keyForId'));
    this.collection.register(this, val);
    this._super();
  }

});
