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
  const done = assert.async();

  this.on('lastVisibleChanged', (item) => {
    this.on('lastVisibleChanged', () => {});
    assert.equal(item.index, 49, 'the last visible changed should be item 49');
    assert.equal(this.$('.scrollable').find('div:last').html(), 'b 49', 'the last item in the list should be rendered');
    done();
  });

  this.set('items', new Array(...new Array(50)).map(() => ({ text: 'b' })));

  this.render(hbs`
  <div style="height: 200px; width: 100px; overflow: hidden;" class="scrollable">
    {{#vertical-collection
      defaultHeight=10
      alwaysRemeasure=true
      bufferSize=0
      content=items
      lastVisibleChanged='lastVisibleChanged' as |item i|}}
      <div style="height: 100px;">{{item.text}} {{i}}</div>
    {{/vertical-collection}}
  </div>
  `);

  const scrollable = this.$('.scrollable');

  wait()
    .then(() => {
      // Jump to bottom.
      scrollable.scrollTop(this.$('.scrollable').prop('scrollHeight'));
    });
});

test('Sends the last visible changed action', function(assert) {
  const done = assert.async();

  this.set('items', new Array(...new Array(50)).map(() => ({ text: 'b' })));
  this.on('lastVisibleChanged', (item) => {
    assert.equal(item.index, 49, 'the last visible changed should be item 30');
    done();
  });

  this.render(hbs`
  <div style="height: 200px; width: 100px; overflow: hidden;" class="scrollable">
    {{#vertical-collection
      defaultHeight=10
      bufferSize=0
      content=items
      lastVisibleChanged='lastVisibleChanged' as |item|}}
      {{item.text}}
    {{/vertical-collection}}
  </div>
  `);

  wait().then(() => this.$('.scrollable').scrollTop(this.$('.scrollable').prop('scrollHeight')));
});

test('Renders multiple collections', function(assert) {
  this.set('itemsA', [{ text: 'a' }]);
  this.set('itemsB', [{ text: 'b' }]);
  this.set('showA', false);
  this.set('showB', false);

  this.render(hbs`
  <div>
    {{#if showA}}
      <div>
      {{#vertical-collection content=itemsA as |item|}}
        {{item.text}}
      {{/vertical-collection}}
      </div>
    {{/if}}
    {{#if showB}}
      <div>
      {{#vertical-collection content=itemsB as |item|}}
        {{item.text}}
      {{/vertical-collection}}
      </div>
    {{/if}}
  </div>
  `);

  Ember.run(() => this.set('showA', true));
  Ember.run(() => this.set('showB', true));
  Ember.run(() => this.set('showA', false));
  Ember.run(() => this.set('showB', false));

  assert.ok(true, 'Showing/hiding multiple collections does not raise an exception');
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
