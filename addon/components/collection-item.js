import Ember from 'ember';
import layout from '../templates/components/collection-item';

const {
  Component
  } = Ember;

const STATE_LIST = ['culled', 'hidden', 'visible'];

const STATE_TRANSITIONS_UP = [
  { state: 'culled', method: '' },
  { state: 'hidden', method: '__smInsert' },
  { state: 'visible', method: '__smReveal' }
];

const STATE_TRANSITIONS_DOWN = [
  { state: 'visible', method: '' },
  { state: 'hidden', method: '__smObscure' },
  { state: 'culled', method: '__smTeardown' }
];

/*
 A collection-item is one that intelligently removes
 its content when scrolled off the screen.

 @class collection-item
 @extends Ember.Component
 @namespace Ember
 **/
export default Component.extend({
  layout,
  tagName: 'collection-item',
  itemTagName: 'collection-item',

  heightProperty: 'minHeight',
  widthProperty: 'minWidth',
  alwaysUseDefaultDim: false,

  classNames: ['collection-item'],

  next() {
    const element = this.element.nextElementSibling;

    return element ? this.registry[element.id] : null;
  },

  prev() {
    const element = this.element.previousElementSibling;

    return element ? this.registry[element.id] : null;
  },

  viewState: 'culled',

  contentVisible: false,
  contentHidden: false,
  contentInserted: false,
  contentCulled: false,

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
    const fromState = this.get('viewState');
    let currentState = fromState;

    if (fromState === toState) {
      return;
    }

    const transitionMap = STATE_LIST.indexOf(fromState) < STATE_LIST.indexOf(toState) ? STATE_TRANSITIONS_UP : STATE_TRANSITIONS_DOWN;
    let i;

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

  /*
   * Destroy the View/Element
   *
   * Unlike the other methods, this method
   * can be called from any state. It is still not valid
   * to transition to it directly, but willDestroy uses it
   * to teardown the instance.
   *
   * @private
   */
  __smTeardown() {
    const dimProp = this.vertical ? this.heightProperty : this.widthProperty;

    if (!this.alwaysUseDefaultDim && this.element && this.get('contentInserted')) {
      this.element.style[dimProp] = this.vertical ? `${this.satellite.geography.height}px` : `${this.satellite.geography.width}px`;
    }
    this.setProperties({ contentCulled: true, contentHidden: false, contentInserted: false });
  },

  /*
   * Insert the Element into the DOM in a hidden state.
   *
   * @private
   */
  __smInsert() {
    this.setProperties({ contentHidden: true, contentCulled: false, contentInserted: true });
  },

  /*
   * Reveal the Element
   *
   * @private
   */
  __smReveal() {
    const dimProp = this.vertical ? this.heightProperty : this.widthProperty;

    this.setProperties({ contentHidden: false, contentVisible: true, contentInserted: true });
    if (!this.alwaysUseDefaultDim) {
      this.element.style[dimProp] = null;
    }
    this.element.style.visibility = 'visible';
  },

  _hasRealDim: false,
  _updateDim() {
    const needsRealDim = !this.get('alwaysUseDefaultDim');

    if (needsRealDim && !this._hasRealDim) {
      this.satellite.resize();
      this._hasRealDim = true;
    }
  },

  updateDim() {
    this._hasRealDim = false;
    this._updateDim();
  },

  /*
   * Hide the Element
   *
   * @private
   */
  __smObscure() {
    this._updateDim();
    this.setProperties({ contentHidden: true, contentVisible: false, contentInserted: true });
    this.element.style.visibility = 'hidden';
  },

  defaultDim: 75,
  index: null,
  content: null,

  radar: null,
  satellite: null,
  registerSatellite(satellite) {
    this.satellite = satellite;
  },
  unregisterSatellite() {
    this.satellite = null;
  },

  _dim: 0,

  didInsertElement() {
    this._super();
    this.radar.register(this);
  },

  willInsertElement() {
    this._super();
    const _dim = this.get('_dim');
    const dimProp = this.vertical ?  this.get('heightProperty') : this.get('widthProperty');
    let defaultDim = this.get('defaultDim');

    if (typeof defaultDim === 'number') {
      defaultDim = `${defaultDim}px`;
    }

    this.element.style.visibility = 'hidden';
    this.element.style[dimProp] = _dim ? `${_dim}px` : defaultDim;
  },

  willDestroyElement() {
    this._super(...arguments);
    this.setProperties({
      viewState: 'culled',
      contentCulled: true,
      contentHidden: false,
      contentInserted: false
    });

    if (this.radar) {
      this.radar.unregister(this);
    }
    this.satellite = null;
  },

  willDestroy() {
    this._super(...arguments);
    this.unregister(this);

    if (this.radar) {
      this.radar.unregister(this);
    }
    this.satellite = null;
    this.registry = null;
  },

  init() {
    this._super(...arguments);
    this.registry = this.container.lookup('-view-registry:main') || Ember.View.views;
    let tag = this.get('itemTagName');

    this.set('tagName', tag);
    tag = tag.toLowerCase();

    const isTableChild = tag === 'tr' || tag === 'td' || tag === 'th';

    // table children don't respect min-height :'(
    this.heightProperty = isTableChild || this.alwaysUseDefaultDim ? 'height' : 'minHeight';

    this.register(this);
  }

});
