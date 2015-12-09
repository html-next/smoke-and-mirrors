import Ember from 'ember';
import layout from '../templates/components/horizontal-item';

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
 A horizontal-item is one that intelligently removes
 its content when scrolled off the screen horizontally.

 @class horizontal-item
 @extends Ember.Component
 @namespace Ember
 **/
export default Component.extend({
  layout,
  tagName: 'horizontal-item',
  itemTagName: 'horizontal-item',

  widthProperty: 'minWidth',
  alwaysUseDefaultWidth: false,

  classNames: ['horizontal-item'],

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
    const widthProp = this.widthProperty;

    if (!this.alwaysUseDefaultWidth && this.element && this.get('contentInserted')) {
      this.element.style[widthProp] = `${this.satellite.geography.width}px`;
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
    const widthProp = this.widthProperty;

    this.setProperties({ contentHidden: false, contentVisible: true, contentInserted: true });
    if (!this.alwaysUseDefaultWidth) {
      this.element.style[widthProp] = null;
    }
    this.element.style.visibility = 'visible';
  },

  _hasRealWidth: false,
  _updateWidth() {
    const needsRealWidth = !this.get('alwaysUseDefaultWidth');

    if (needsRealWidth && !this._hasRealWidth) {
      this.satellite.resize();
      this._hasRealWidth = true;
    }
  },

  updateWidth() {
    this._hasRealWidth = false;
    this._updateWidth();
  },

  /*
   * Hide the Element
   *
   * @private
   */
  __smObscure() {
    this._updateWidth();
    this.setProperties({ contentHidden: true, contentVisible: false, contentInserted: true });
    this.element.style.visibility = 'hidden';
  },

  defaultWidth: 75,
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

  _width: 0,

  didInsertElement() {
    this._super();
    this.radar.register(this);
  },

  willInsertElement() {
    this._super();
    const _width = this.get('_width');
    const widthProp = this.get('widthProperty');
    let defaultWidth = this.get('defaultWidth');

    if (typeof defaultWidth === 'number') {
      defaultWidth = `${defaultWidth}px`;
    }

    this.element.style.visibility = 'hidden';
    this.element.style[widthProp] = _width ? `${_width}px` : defaultWidth;
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

    // table children don't respect min-width :'(
    this.widthProperty = isTableChild || this.alwaysUseDefaultWidth ? 'width' : 'minWidth';
    this.register(this);
  }

});
