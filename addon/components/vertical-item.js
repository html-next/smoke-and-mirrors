import Ember from 'ember';
import StateMapMixin from '../mixins/state-map';
import layout from '../templates/components/vertical-item';
import keyMixin from '../mixins/key-for-item';

const IS_GLIMMER = (Ember.VERSION.indexOf('2') === 0 || Ember.VERSION.indexOf('1.13') === 0);

/**
 A vertical-item is one that intelligently removes
 its content when scrolled off the screen vertically.

 @class vertical-item
 @extends Ember.Component
 @namespace Ember
 **/
export default Ember.Component.extend(keyMixin, StateMapMixin, {

  layout: layout,
  tagName: 'vertical-item',

  classNameBindings: ['viewStateClass'],
  collection: null,

  defaultHeight: 75,
  index: null,

  _height: 0,

  willInsertElement() {

    let _height = this.get('_height');
    let defaultHeight = this.get('defaultHeight');
    if (typeof defaultHeight === 'number') {
      defaultHeight += 'px';
    }

    this.element.style.visibility = 'hidden';
    this.element.style.minHeight = _height ? _height + 'px' : defaultHeight;

  },

  didReceiveAttrs(attrs) {
    let index = this.get('index');
    let oldKeyVal = this.keyForValue(attrs.oldAttrs.content.value, index);
    let newKeyVal = this.keyForValue(attrs.newAttrs.content.value, index);
    if (oldKeyVal && newKeyVal && oldKeyVal !== newKeyVal) {
      this.collection.unregister(oldKeyVal);
      this.collection.register(this, newKeyVal);
    }
  },

  willDestroyElement() {
    this._super();
    this._ov_teardown();
    this.set('viewState', 'culled');

    if (IS_GLIMMER) {
      let key = this.keyForItem(this, this.get('index'));
      this.collection.unregister(key);
    }
  },

  init() {
    this._super();
    if (IS_GLIMMER) {
      let key = this.keyForItem(this, this.get('index'));
      this.collection.register(this, key);
    }
  }

});
