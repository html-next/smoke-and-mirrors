import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';


moduleForComponent('horizontal-collection', 'Integration | Component | horizontal collection', {
  integration: true
});

test('it renders', function(assert) {
  assert.expect(2);

  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`{{horizontal-collection}}`);

  assert.equal(this.$().text(), '');

  // Template block usage:
  this.render(hbs`
    {{#horizontal-collection}}
      template block text
    {{/horizontal-collection}}
  `);

  assert.equal(this.$().text().trim(), 'template block text');
});
