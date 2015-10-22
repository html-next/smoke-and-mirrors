import Ember from 'ember';
import PreRenderMixin from '../../../mixins/pre-render';
import { module, test } from 'qunit';

module('Unit | Mixin | pre render');

// Replace this with your real tests.
test('it works', function(assert) {
  var PreRenderObject = Ember.Object.extend(PreRenderMixin);
  var subject = PreRenderObject.create();
  assert.ok(subject);
});
