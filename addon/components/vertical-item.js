import Ember from 'ember';
import StateMapMixin from '../mixins/state-map';
import layout from '../templates/components/vertical-item';

/**
 A vertical-item is one that intelligently removes
 its content when scrolled off the screen vertically.

 @class vertical-item
 @extends Ember.Component
 @namespace Ember
 **/
export default Ember.Component.extend(StateMapMixin, {

  layout: layout,
  tagName: 'vertical-item',

  classNameBindings: ['viewStateClass'],
  collection: null,

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

  didReceiveAttrs(attrs) {
    var key = this.get('keyForId');
    var oldKeyVal = attrs.oldAttrs ? attrs.oldAttrs.content.value[key] : false;
    var newKeyVal = attrs.oldAttrs ? attrs.newAttrs.content.value[key] : false;
    if (oldKeyVal && newKeyVal && oldKeyVal !== newKeyVal) {
      this.collection.unregister(oldKeyVal);
      this.collection.register(this, newKeyVal);
    }
  },

  willDestroyElement() {
    this._super();
    this._ov_teardown();
    this.set('viewState', 'culled');
    var key = this.get('keyForId');
    var val = this.get('content.' + key);
    this.collection.unregister(val);
  },

  init() {
    this._super();
    var val = this.get('content.' + this.get('keyForId'));
    this.collection.register(this, val);
  }

});
