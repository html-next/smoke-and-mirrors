import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('smart-collection', 'Integration | Component | smart collection', {
  integration: true
});

test('it renders', function(assert) {

  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });" + EOL + EOL +

  this.set('people', [{name: 'Chris Thoburn'}]);

  // Template block usage:" + EOL +
  this.render(hbs`
    {{#smart-collection people as |person|}}
      {{person.name}}
    {{/smart-collection}}
  `);

  assert.equal(this.$('vertical-collection').get(0).tagName, 'VERTICAL-COLLECTION');
});
