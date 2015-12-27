import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import Ember from 'ember';

moduleForComponent('sm-collection', 'Integration | Component | sm-collection', {
  integration: true
});

test('The Collection Renders', function(assert) {
  assert.expect(1);

  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });
  this.set('items', Ember.A([Ember.Object.create({ text: 'b' })]));

  // Template block usage:
  this.render(hbs`
  <div style="height: 500px; width: 500px;">
    {{#sm-collection content=items as |item|}}
      {{item.text}}
    {{/sm-collection}}
  </div>
  `);

  assert.equal(this.$().find('collection-item').length, 1);
});

/*
test("The Collection Reveals it's children when `renderAllInitially` is true.", function(assert) {
  assert.expect(1);

  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });
  this.set('items', Ember.A([Ember.Object.create({ text: 'b' })]));

  // Template block usage:
  this.render(hbs`
  <div style="height: 500px; width: 500px;">
    {{#vertical-collection content=items renderAllInitially=true as |item|}}
      {{item.text}}
    {{/vertical-collection}}
  </div>
  `);

  assert.equal(this.$().find('vertical-item').first().get(0).innerHTML, 'b');
});
*/
