import Ember from 'ember';
import StateMapMixin from '../mixins/state-map';
import layout from '../templates/components/vm-item';

/**
 A vertical-item is one that intelligently removes
 its content when scrolled off the screen vertically.

 @class vm-item
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

  willInsertElement() {
    this._super();
    var _height = this.get('_height');
    var defaultHeight = this.get('defaultHeight');
    if (typeof defaultHeight === 'number') {
      defaultHeight += 'px';
    }

    this.element.style.visibility = 'hidden';
    this.element.style.minHeight = _height ? _height + 'px' : defaultHeight;
  },

  willDestroyElement() {
    this._super();
    this._ov_teardown();
    this.set('viewState', 'culled');
  }

});
