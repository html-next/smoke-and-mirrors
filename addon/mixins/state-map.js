import Ember from 'ember';

const {
  computed,
  run
  } = Ember;


export default Ember.Mixin.create({

  viewState: 'culled',

  contentVisible: false,
  contentHidden: false,
  contentInserted: false,
  contentCulled: false,

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
    if (this.get('contentInserted')) {
      this.element.style.minHeight = jQuery(this.element).height() + 'px';
    }
    this.setProperties({ contentCulled: true, contentHidden: false, contentInserted: false });
  },


  /**!
   * Insert the Element into the DOM in a hidden state.
   *
   * @private
   */
  _ov_insert: function() {
    this.setProperties({ contentHidden: true, contentCulled: false, contentInserted: true });
    run.schedule('afterRender', this, function() {
      if (!this.get('isDestroyed')) {
        // allow height to change organically while the element is inDom
        this.element.style.minHeight = null;
      }
    });
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
  }


});
