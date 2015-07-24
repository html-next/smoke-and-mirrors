import Ember from 'ember';
import MagicArrayMixin from '../../../mixins/magic-array';
import { module, test } from 'qunit';

module('Unit | Mixin | magic array');

// Replace this with your real tests.
test('it works', function(assert) {
  var MagicArrayObject = Ember.Object.extend(MagicArrayMixin);
  var subject = MagicArrayObject.create();
  assert.ok(subject);
});
