import Ember from 'ember';
import StagedArrayMixin from '../../../mixins/staged-array';
import { module, test } from 'qunit';

module('Unit | Mixin | staged array');

// Replace this with your real tests.
test('it works', function(assert) {
  var StagedArrayObject = Ember.Object.extend(StagedArrayMixin);
  var subject = StagedArrayObject.create();
  assert.ok(subject);
});
