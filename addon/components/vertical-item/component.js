import Ember from 'ember';
import layout from './template';
import Token from '../../-private/scheduler/token';
import scheduler from '../../-private/scheduler';

const {
  Component
  } = Ember;

/*
 A vertical-item is one that intelligently removes
 its content when scrolled off the screen vertically.

 @class vertical-item
 @extends Ember.Component
 @namespace Ember
 **/
export default Component.extend({
  layout,
  tagName: 'vertical-item',
  classNames: ['vertical-item'],

  alwaysRemeasure: false,
  item: null,
  parentToken: null,
  _nextMeasure: null,
  _previousItem: null,

  willRender() {
    let item = this.get('item.content');

    if (this._previousItem && this._previousItem !== item) {
      this._previousItem.geography.element = null;
      this._previousItem = item;
    }
  },

  willDestroyElement() {
    this._previousItem = null;
    let item = this.get('item.content');

    if (item) {
      item.geography.element = null;
    }
  },

  didRender() {
    if (this._nextMeasure === null) {
      this.schedule('measure', () => {
        let item = this.get('item.content');
        item.geography.element = this.element;
        item.geography.setState();
        this._nextMeasure = null;
      });
    }
  },

  schedule(queueName, job) {
    return scheduler.schedule(queueName, job, this.token);
  },

  init() {
    this._super();
    this.token = new Token(this.parentToken);
  }
});
