import Ember from 'ember';
import StateMapMixin from '../mixins/state-map';
import layout from '../templates/components/vertical-item';
import LinkedComponentMixin from '../mixins/linked-component-list';

const {
  Component
  } = Ember;

/**
 A vertical-item is one that intelligently removes
 its content when scrolled off the screen vertically.

 @class vertical-item
 @extends Ember.Component
 @namespace Ember
 **/
export default Component.extend(LinkedComponentMixin, StateMapMixin, {

  layout: layout,
  tagName: 'vertical-item',
  itemTagName: 'vertical-item',

  heightProperty: 'minHeight',

  attributeBindings: ['viewState'],
  classNames: ['vertical-item'],
  collection: null,

  defaultHeight: 75,
  index: null,

  radar: null,
  satellite: null,
  registerSatellite(satellite) {
    this.satellite = satellite;
  },

  _height: 0,

  didInsertElement() {
    this._super();
    this.get('radar').register(this);
  },

  willInsertElement() {
    this._super();
    let _height = this.get('_height');
    let heightProp = this.get('heightProperty');
    let defaultHeight = this.get('defaultHeight');
    if (typeof defaultHeight === 'number') {
      defaultHeight += 'px';
    }

    this.element.style.visibility = 'hidden';
    this.element.style[heightProp] = _height ? _height + 'px' : defaultHeight;
  },

  willDestroyElement() {
    this._super();
    this._ov_teardown();
    this.set('viewState', 'culled');
    this.get('radar').unregister(this);
  },

  willDestroy() {
    this._super();
    this.collection.unregister(this);
  },

  init() {
    this._super();

    let tag = this.get('itemTagName');
    this.set('tagName', tag);
    tag = tag.toLowerCase();

    let isTableChild = tag === 'tr' || tag === 'td' || tag === 'th';
    // table children don't respect min-height :'(
    this.heightProperty = isTableChild ? 'height' : 'minHeight';
    this.collection.register(this);
  }

});
