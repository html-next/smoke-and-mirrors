import Ember from 'ember';
import StateMapMixin from '../../../mixins/state-map';
import { module, test } from 'qunit';

module('Unit | Mixin | state map');

// Replace this with your real tests.
test('it works', function(assert) {
  var StateMapObject = Ember.Object.extend(StateMapMixin);
  var subject = StateMapObject.create();
  assert.ok(subject);
});
