import Ember from 'ember';
import layout from '../templates/components/vertical-item';

const {
  Component
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
 A vertical-item is one that intelligently removes
 its content when scrolled off the screen vertically.

 @class vertical-item
 @extends Ember.Component
 @namespace Ember
 **/
export default Component.extend({
  layout: layout,
  tagName: 'vertical-item',
  itemTagName: 'vertical-item',

  heightProperty: 'minHeight',
  alwaysUseDefaultHeight: false,

  classNames: ['vertical-item'],

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
  _ov_teardown() {
    let heightProp = this.heightProperty;
    if (!this.alwaysUseDefaultHeight && this.element && this.get('contentInserted')) {
      this.element.style[heightProp] = this.satellite.geography.height + 'px';
    }
    this.setProperties({ contentCulled: true, contentHidden: false, contentInserted: false });
  },

  /*
   * Insert the Element into the DOM in a hidden state.
   *
   * @private
   */
  _ov_insert() {
    this.setProperties({ contentHidden: true, contentCulled: false, contentInserted: true });
  },

  /*
   * Reveal the Element
   *
   * @private
   */
  _ov_reveal() {
    let heightProp = this.heightProperty;
    this.setProperties({ contentHidden: false, contentVisible: true, contentInserted: true });
    if (!this.alwaysUseDefaultHeight) {
      this.element.style[heightProp] = null;
    }
    this.element.style.visibility = 'visible';
  },

  _hasRealHeight: false,
  _updateHeight() {
    let needsRealHeight = !this.get('alwaysUseDefaultHeight');
    if (needsRealHeight && !this._hasRealHeight) {
      this.satellite.resize();
      this._hasRealHeight = true;
    }
  },

  updateHeight() {
    this._hasRealHeight = false;
    this._updateHeight();
  },

  /*
   * Hide the Element
   *
   * @private
   */
  _ov_obscure() {
    this._updateHeight();
    this.setProperties({ contentHidden: true, contentVisible: false, contentInserted: true });
    this.element.style.visibility = 'hidden';
  },

  defaultHeight: 75,
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

  _height: 0,

  didInsertElement() {
    this._super();
    this.radar.register(this);
  },

  willInsertElement() {
    this._super();
    const _height = this.get('_height');
    const heightProp = this.get('heightProperty');
    let defaultHeight = this.get('defaultHeight');

    if (typeof defaultHeight === 'number') {
      defaultHeight += 'px';
    }

    this.element.style.visibility = 'hidden';
    this.element.style[heightProp] = _height ? _height + 'px' : defaultHeight;
  },

  willDestroyElement() {
    this._super(...arguments);
    this.setProperties({
      viewState: 'culled',
      contentCulled: true,
      contentHidden: false,
      contentInserted: false });
    const radar = this.radar;

    if (radar) {
      radar.unregister(this);
    }
    this.satellite = null;
  },

  willDestroy() {
    this._super(...arguments);
    this.unregister(this);
    const radar = this.radar;

    if (radar) {
      radar.unregister(this);
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
    this.heightProperty = isTableChild || this.alwaysUseDefaultHeight ? 'height' : 'minHeight';
    this.register(this);
  }

});
