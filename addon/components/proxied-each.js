import Ember from 'ember';
import MagicArrayMixin from '../mixins/magic-array';
import layout from '../templates/components/proxied-each';

export default Ember.Component.extend(MagicArrayMixin, {
  tagName: ''
});
