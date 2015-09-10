import Ember from 'ember';
import StateMapMixin from '../mixins/state-map';
import layout from '../templates/components/vertical-item';

const IS_GLIMMER = (Ember.VERSION.indexOf('2') === 0 || Ember.VERSION.indexOf('1.13') === 0);

const {
  Component,
  computed
  } = Ember;

/**
 A vertical-item is one that intelligently removes
 its content when scrolled off the screen vertically.

 @class vertical-item
 @extends Ember.Component
 @namespace Ember
 **/
export default Component.extend(StateMapMixin, {

  layout: layout,
  tagName: 'vertical-item',
  itemTagName: 'vertical-item',

  isTableChild: computed('itemTagName', function() {
    let tag = this.get('itemTagName').toLowerCase();
    return tag === 'tr' || tag === 'td' || tag === 'th';
  }),

  // table children don't respect min-height :'(
  heightProperty: computed('isTableChild', function() {
    return this.get('isTableChild') ? 'height' : 'minHeight';
  }),

  scrollTarget: null,
  isScrollTarget: computed('scrollTarget', function() {
    return this.element && this.element === this.get('scrollTarget');
  }),

  classNames: ['vertical-item'],
  classNameBindings: ['viewStateClass'],
  collection: null,

  defaultHeight: 75,
  index: null,

  _height: 0,

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
  },

  willDestroy() {
    this._super();
    this.collection.unregister(this);
  },

  init() {
    this._super();
    this.set('tagName', this.get('itemTagName'));
    this.collection.register(this);
  }

});
