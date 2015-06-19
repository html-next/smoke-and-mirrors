import Ember from 'ember';

const {
  on,
  inject,
  get: get,
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

  zoneRatio: 1,
  occludeX: true,
  occludeY: false,
  occludeAt: 2,
  hideAt: 1,

  classNameBindings: ['viewStateClass'],
  viewState: 'hidden',
  contentVisible: false,
  contentHidden: false,
  contentInserted: false,
  contentCulled: false,

  _height: 0,

  willInsertElement: function() {
    this.element.style.visibility = 'hidden';
    this._super();
  },

  '__in-viewport': inject.service('in-viewport'),

  '__register-component': on('didInsertElement', function() {
    get(this, '__in-viewport').register(this, this.get('zoneRatio'));
  }),

  '__unregister-component': on('willDestroyElement', function() {
    get(this, '__in-viewport').unregister(this);
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
    var rect = this.get('_dimensions');
    this.element.style.height= rect.height + 'px';
    this.element.style.width= rect.width + 'px';
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
        this.element.style.height = null;
        this.element.style.width = null;
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
  },

  __cleanup: null,
  __setZone: function(zoneX) {
    var hideAt = this.get('hideAt');
    var occludeAt = this.get('occludeAt');
    var zone = Math.abs(zoneX);

    if (zone >= occludeAt) {
      this.cull();
      return;
    }
    if (zone >= hideAt) {
      this.hide();
      return;
    }
    this.show();
  },

  actions: {

    zoneChange: function(zone) {
      run.throttle(this, this.__setZone, zone, 4);
      run.cancel(this.__cleanupX);
      this.__cleanupX = run.later(this, this.__setZone, zone, 8);
    }

  }

});
