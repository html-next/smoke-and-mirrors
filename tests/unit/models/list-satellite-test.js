import { module, test } from 'qunit';
import ListSatellite from 'smoke-and-mirrors/models/list-satellite';

module('Unit | Model | ListSatellite', {

  beforeEach(assert) {

    // stubbed components for the tests
    let planetA = document.createElement('div');
    document.body.appendChild(planetA);

    let planetB = document.createElement('div');
    document.body.appendChild(planetB);

    let planetC = document.createElement('div');
    document.body.appendChild(planetC);

    assert.componentA = {
      element: planetA,
      satellite: true
    };

    assert.componentB = {
      element: planetB,
      satellite: true
    };

    assert.componentC = {
      element: planetC,
      satellite: true
    };

  },

  afterEach(assert) {
    function teardown(c) {
      c.element.parentNode.removeChild(c.element);
      c.element = null;
    }
    teardown(assert.componentA);
    teardown(assert.componentB);
    teardown(assert.componentC);
  }

});

test('ListSatellite should build appropriately', (assert) => {
  assert.expect(2);

  let satA = new ListSatellite(assert.componentA);

  assert.equal(satA.element.element, assert.componentA.element, "The Satellite.element VirtualElement was set from the component's element");
  assert.equal(satA.radar, undefined, "radar initialized and not set");

});

test('ListSatellite.next,prev functions as expected', (assert) => {
  assert.expect(4);

  let satA = new ListSatellite(assert.componentA);

  assert.equal(satA.next(), null, 'The next satellite is initially unset');
  assert.equal(satA.prev(), null, 'The prev satellite is initially unset');

  let satB = new ListSatellite(assert.componentB, satA);

  assert.ok(satB.prev() === satA, 'The prev satellite is properly set');
  assert.ok(satA.next() === satB, 'The next satellite is properly set on the previous satellite');
});

test('ListSatellite.destroy works properly', (assert) => {

  assert.expect(8);

  let satA = new ListSatellite(assert.componentA);
  let satB = new ListSatellite(assert.componentB, satA);
  let satC = new ListSatellite(assert.componentC, satB);

  assert.ok(satB.prev() === satA, 'The prev satellite is properly set on the satellite');
  assert.ok(satA.next() === satB, 'The next satellite is properly set on the previous satellite');
  assert.ok(satB.next() === satC, 'The next satellite is properly set on the satellite');
  assert.ok(satC.prev() === satB, 'The prev satellite is properly set on the next satellite');

  satB.destroy();

  assert.ok(satB.prev() === null, 'The prev satellite is properly unset on the satellite');
  assert.ok(satA.next() === satC, 'The next satellite is properly updated on the previous satellite');
  assert.ok(satB.next() === null, 'The next satellite is properly unset on the satellite');
  assert.ok(satC.prev() === satA, 'The prev satellite is properly updated on the next satellite');

});
