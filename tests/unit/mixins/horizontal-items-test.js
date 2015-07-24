import Ember from 'ember';
import HorizontalItemsMixin from '../../../mixins/horizontal-items';
import { module, test } from 'qunit';

module('Unit | Mixin | horizontal items');

// Replace this with your real tests.
test('it works', function(assert) {
  var HorizontalItemsObject = Ember.Object.extend(HorizontalItemsMixin);
  var subject = HorizontalItemsObject.create();
  assert.ok(subject);
});
