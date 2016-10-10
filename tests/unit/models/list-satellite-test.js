import { module, test } from 'qunit';
import ListSatellite from 'smoke-and-mirrors/-private/radar/models/list-satellite';

let App = {};

module('Unit | Model | ListSatellite', {

  beforeEach() {

    App.planetADiv = document.createElement('div');
    document.body.appendChild(App.planetADiv);
    App.planetBDiv = document.createElement('div');
    document.body.appendChild(App.planetBDiv);

    App.componentA = {
      element: App.planetADiv,
      next() {},
      prev() {},
      satellite: true
    };
    App.componentB = {
      element: App.planetBDiv,
      next() {},
      prev() {},
      satellite: true
    };

  },

  afterEach() {
    App.planetADiv.parentNode.removeChild(App.planetADiv);
    App.planetBDiv.parentNode.removeChild(App.planetBDiv);
    App = {};
  }

});

test('should build correctly', (assert) => {

  assert.expect(4);

  let testListSatellite = new ListSatellite(App.componentA, [App.componentA, App.componentB]);

  assert.equal(testListSatellite.component, App.componentA, 'compenent set');
  assert.equal(testListSatellite.element, App.planetADiv, 'element set');
  assert.equal(testListSatellite.radar, undefined, 'radar initialized and not set');
  assert.deepEqual(testListSatellite.list, [App.componentA, App.componentB], 'list set');

});

test('next and prev return null when only one component', (assert) => {

  assert.expect(2);

  let testListSatellite = new ListSatellite(App.componentA, [App.componentA]);

  assert.equal(testListSatellite.next(), null, 'no next element');
  assert.equal(testListSatellite.prev(), null, 'no prev element');

});

test('next and prev work as expected', (assert) => {

  assert.expect(4);

  App.componentA.next = function() {
    return App.componentB;
  };
  App.componentB.prev = function() {
    return App.componentA;
  };

  let testListSatelliteA = new ListSatellite(App.componentA, [App.componentA, App.componentB]);
  let testListSatelliteB = new ListSatellite(App.componentB, [App.componentA, App.componentB]);

  assert.equal(testListSatelliteA.next(), true, 'Component B is after Component A');
  assert.equal(testListSatelliteB.next(), null, 'Nothing is after Component B');
  assert.equal(testListSatelliteA.prev(), null, 'Nothing is before Component A');
  assert.equal(testListSatelliteB.prev(), true, 'Component A is before Component B');

});

test('destroy works properly', (assert) => {

  assert.expect(7);

  App.componentA.unregisterSatellite = function() {
    assert.ok(true, 'The Component unregisterSatellite hook is called');
  };
  let testListSatellite = new ListSatellite(App.componentA, [App.componentA, App.componentB]);

  testListSatellite.geography.destroy = function() {
    assert.ok(true, 'geography.destroy hook called');
  };

  testListSatellite.destroy();

  assert.equal(testListSatellite.component, null, 'component destroyed');
  assert.equal(testListSatellite.satellite, null, 'satellite destroyed');
  assert.equal(testListSatellite.element, null, 'element destroyed');
  assert.equal(testListSatellite.geography, null, 'geography destroyed');
  assert.equal(testListSatellite.list, null, 'list destroyed');

});
