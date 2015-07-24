import Ember from 'ember';
import OcclusionCollectionMixin from '../../../mixins/occlusion-collection';
import { module, test } from 'qunit';

module('Unit | Mixin | occlusion collection');

// Replace this with your real tests.
test('it works', function(assert) {
  var OcclusionCollectionObject = Ember.Object.extend(OcclusionCollectionMixin);
  var subject = OcclusionCollectionObject.create();
  assert.ok(subject);
});
