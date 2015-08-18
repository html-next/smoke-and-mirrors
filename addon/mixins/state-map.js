import Ember from 'ember';
import jQuery from 'jquery';
import nextFrame from '../utils/next-frame';

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

export default Ember.Mixin.create({

  viewState: 'culled',

  contentVisible: false,
  contentHidden: false,
  contentInserted: false,
  contentCulled: false,

  viewStateClass: computed('viewState', function() {
    return 'state-' + this.get('viewState');
  }),

  show() {
    this._setState('visible');
  },

  hide() {
    this._setState('hidden');
  },

  cull() {
    this._setState('culled');
  },

  _setState(toState) {

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
  _ov_teardown() {
    if (this.get('contentInserted') && this.element) {
      this.element.style.minHeight = jQuery(this.element).height() + 'px';
    }
    this.setProperties({ contentCulled: true, contentHidden: false, contentInserted: false });
  },


  /**!
   * Insert the Element into the DOM in a hidden state.
   *
   * @private
   */
  _ov_insert() {
    this.setProperties({ contentHidden: true, contentCulled: false, contentInserted: true });
  },


  /**!
   * Reveal the Element
   *
   * @private
   */
  _ov_reveal() {
    this.setProperties({ contentHidden: false, contentVisible: true, contentInserted: true });
    this.element.style.minHeight = null;
    this.element.style.visibility = 'visible';
  },


  /**!
   * Hide the Element
   *
   * @private
   */
  _ov_obscure() {
    this.setProperties({ contentHidden: true, contentVisible: false, contentInserted: true });
    this.element.style.visibility = 'hidden';
  }


});
