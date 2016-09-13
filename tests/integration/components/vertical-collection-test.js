import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import Ember from 'ember';
import wait from 'ember-test-helpers/wait';

moduleForComponent('vertical-collection', 'Integration | Component | vertical collection', {
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
    {{#vertical-collection content=items as |item|}}
      {{item.text}}
    {{/vertical-collection}}
  </div>
  `);

  return wait().then(() => {
    assert.equal(this.$().find('vertical-item').length, 1);
  });
});

test('The Collection Renders when content is empty', function(assert) {
  assert.expect(1);

  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });
  this.set('items', Ember.A([]));

  // Template block usage:
  this.render(hbs`
  <div style="height: 500px; width: 500px;">
    {{#vertical-collection content=items as |item|}}
      {{item.text}}
    {{/vertical-collection}}
  </div>
  `);

  return wait().then(() => {
    assert.equal(this.$().find('vertical-item').length, 0);
  });
});

test('Adds classes to vertical-items', function(assert) {
  assert.expect(2);

  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });
  this.set('items', Ember.A([Ember.Object.create({ text: 'b' })]));

  // Template block usage:
  this.render(hbs`
  <div style="height: 500px; width: 500px;">
    {{#vertical-collection content=items itemClassNames='cool classes' as |item|}}
      {{item.text}}
    {{/vertical-collection}}
  </div>
  `);

  return wait().then(() => {
    assert.ok(this.$('vertical-item').hasClass('cool'), 'should have cool class');
    assert.ok(this.$('vertical-item').hasClass('classes'), 'should have classes class');
  });
});

test('Scroll to last item when actual item sizes are significantly larger than default item size.', function(assert) {
  assert.expect(1);

  this.set('items', new Array(50).fill({ text: 'b' }));

  this.render(hbs`
  <div style="height: 200px; width: 100px;" class="scrollable">
    {{#vertical-collection
      defaultHeight=10
      alwaysUseDefaultHeight=false
      bufferSize=0
      content=items as |item i|}}
      <div style="height: 100px;">{{item.text}} {{i}}</div>
    {{/vertical-collection}}
  </div>
  `);

  const scrollable = this.$('.scrollable');
  const waitForScroll = new Ember.RSVP.Promise((resolve) => scrollable.scroll(resolve));

  return wait()
    .then(() => {
      // Jump to bottom.
      scrollable.scrollTop(scrollable.get(0).scrollHeight);
    })
    .then(waitForScroll)
    .then(wait)
    .then(() => {
      assert.equal(scrollable.find('div:last').html(), 'b 49', 'the last item in the list should be rendered');
    });
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
