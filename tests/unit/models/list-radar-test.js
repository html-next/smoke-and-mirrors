import { module, test } from 'qunit';
import ListRadar from 'smoke-and-mirrors/-private/radar/models/list-radar';

const RELATIVE_UNIT = 100;
let App = {};

module('Unit | Model | ListRadar', {

  beforeEach() {
    App.listRadar = new ListRadar();
    App.planet = document.createElement('div');
    App.component = { element: App.planet };
  },

  afterEach() {
    App = {};
  }

});

test('create empty ListRadar', (assert) => {

  assert.expect(9);

  assert.ok(App.listRadar.isTracking, 'isTracking set');
  assert.deepEqual(App.listRadar.satellites, [], 'satellites set');
  assert.equal(App.listRadar.planet, null, 'planet set');
  assert.equal(App.listRadar.minimumMovement, 15, 'minimumMovement set');
  assert.equal(App.listRadar.posX, 0, 'posX set');
  assert.equal(App.listRadar.posY, 0, 'posY set');
  assert.equal(App.listRadar.scrollX, 0, 'scrollX set');
  assert.equal(App.listRadar.scrollY, 0, 'scrollY set');
  assert.equal(App.listRadar.resizeDebounce, 64, 'resizeDebounce set');

});

test('register', (assert) => {

  assert.expect(2);

  assert.equal(App.listRadar.satellites.length, 0, 'no satellites registered yet');

  App.listRadar.register(App.component);

  assert.equal(App.listRadar.satellites.length, 1, 'satellite registered');

});

test('_resize without change', (assert) => {

  assert.expect(1);

  App.listRadar.register(App.component);

  App.listRadar.satellites.forEach((c) => {
    c.resize = function() {
      assert.ok(true, 'satellite resize hook called');
      return false;
    };
  });

  App.listRadar._resize();

});

test('_resize with change', (assert) => {

  assert.expect(1);

  App.listRadar.register(App.component);

  App.listRadar.satellites.forEach((satellite) => {
    satellite.next = function() {
      return this;
    };

    satellite.shift = function() {
      assert.ok(true, 'shift hook called');
      satellite.next = function() {
        return null;
      };
    };

    satellite.resize = function() {
      return { dX: RELATIVE_UNIT, dY: RELATIVE_UNIT };
    };
  });

  App.listRadar._resize();

});

test('_adjust', (assert) => {

  assert.expect(1);

  App.listRadar.register(App.component);

  App.listRadar.satellites.forEach((satellite) => {
    satellite.next = function() {
      return this;
    };

    satellite.shift = function() {
      assert.ok(true, 'shift hook called');
      satellite.next = function() {
        return null;
      };
    };
  });

  let [satellite] = App.listRadar.satellites;
  let change = { dX: RELATIVE_UNIT, dY: RELATIVE_UNIT };

  App.listRadar._adjust(satellite, change);

});
