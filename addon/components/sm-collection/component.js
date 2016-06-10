import Ember from 'ember';
import layout from './template';
import DebugMixin from 'smoke-and-mirrors/-debug/edge-visualization/debug-mixin';

const {
  Component,
  computed
  } = Ember;

const Collection = Component.extend({
  layout,
  tagName: 'sm-collection',

  // available as a positionalParam
  items: null,

  actualizedItems: computed.alias('items')

});

Collection.reopenClass({
  positionalParams: ['items']
});

Ember.runInDebug(() => {
  Collection.reopen(DebugMixin);
});

export default Collection;
