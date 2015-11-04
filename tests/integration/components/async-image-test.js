import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';


moduleForComponent('async-image', 'Integration | Component | async image', {
  integration: true
});

test('it renders', function(assert) {
  assert.expect(2);

  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`{{async-image}}`);

  assert.equal(this.$().text(), '');

  // Template block usage:
  this.render(hbs`
    {{async-image}}
  `);

  assert.equal(this.$().get(0).firstElementChild.tagName, 'IMG');
});
