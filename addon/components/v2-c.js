import Ember from 'ember';
import layout from '../templates/components/v2-c';

const {
  Component,
  computed
  } = Ember;

export default Component.extend({
  layout: layout,

  items: null,

  _heightAbove: 0,
  _heightBelow: 0,

  defaultItemHeight: 50,

  scrollToItem(item) {

  },

  _visibleCount: computed('screenHeight', 'defaultItemHeight', function() {

  }),

  _topItem: computed('scrollPosition', 'startItem', function() {

  }),

  visibleItems: computed('_topItem', '_visibleCount', function() {

  })

});
