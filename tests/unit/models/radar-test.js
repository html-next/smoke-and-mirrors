import { module, test } from 'qunit';
import Radar from 'smoke-and-mirrors/models/radar';
import Geography from 'smoke-and-mirrors/models/geography';
import Satellite from 'smoke-and-mirrors/models/satellite';

const RELATIVE_UNIT = 100;

module('Unit | Model | Radar', {

  beforeEach(assert) {

    assert.planetADiv = document.createElement('div');

    assert.planetADiv.style.height = `${RELATIVE_UNIT}px`;
    assert.planetADiv.style.width = `${RELATIVE_UNIT}px`;
    assert.planetADiv.style.position = 'absolute';
    assert.planetADiv.style.top = `${RELATIVE_UNIT}px`;
    assert.planetADiv.style.left = `${RELATIVE_UNIT}px`;
    document.body.appendChild(assert.planetADiv);

    assert.planetBDiv = document.createElement('div');

    assert.planetBDiv.style.height = `${RELATIVE_UNIT * 2}px`;
    assert.planetBDiv.style.width = `${RELATIVE_UNIT * 2}px`;
    assert.planetBDiv.style.position = 'absolute';
    assert.planetBDiv.style.top = `${(RELATIVE_UNIT * 2)}px`;
    assert.planetBDiv.style.left = `${(RELATIVE_UNIT * 2)}px`;
    document.body.appendChild(assert.planetBDiv);

    assert.radar = new Radar({
      telescope: assert.planetADiv,
      sky: assert.planetBDiv
    });

    assert.componentA = { element: assert.planetADiv };
    assert.radar.register(assert.componentA);

    assert.componentB = { element: assert.planetBDiv };
    assert.radar.register(assert.componentB);

  },

  afterEach(assert) {
    assert.planetADiv.parentNode.removeChild(assert.planetADiv);
  }

});

test('create empty radar', (assert) => {

  assert.expect(13);

  let testRadar = new Radar();

  assert.deepEqual(testRadar.satellites, [], "satellites set");
  assert.equal(testRadar.telescope, null, "telescope set");
  assert.equal(testRadar.sky, null, "sky set");
  assert.equal(testRadar.planet, undefined, "planet set");
  assert.equal(testRadar.scrollContainer, undefined, "scrollContainer set");
  assert.equal(testRadar.skyline, null, "skyline set");
  assert.ok(testRadar.isTracking, "isTracking set");
  assert.equal(testRadar.scrollX, 0, "scrollX set");
  assert.equal(testRadar.scrollY, 0, "scrollY set");
  assert.equal(testRadar.posX, 0, "posX set");
  assert.equal(testRadar.posY, 0, "posY set");
  assert.equal(testRadar.minimumMovement, 15, "minimumMovement set");
  assert.equal(testRadar.resizeDebounce, 64, "resizeDebounce set");
});

test('should build correctly with a state', (assert) => {

  assert.expect(13);

  let testPlanet = new Geography(assert.planetADiv);
  let testSkyline = new Geography(assert.planetBDiv);
  let state = {
    telescope: assert.planetADiv,
    sky: assert.planetBDiv,
    minimumMovement: 30,
    resizeDebounce: 128,
    isTracking: false
  };
  let testRadar = new Radar(state);

  assert.deepEqual(testRadar.satellites, [], "satellites set");
  assert.equal(testRadar.telescope, assert.planetADiv, "telescope set");
  assert.equal(testRadar.sky, assert.planetBDiv, "sky set");
  assert.deepEqual(testRadar.planet, testPlanet, "planet set");
  assert.deepEqual(testRadar.scrollContainer, assert.planetADiv, "scrollContainer set");
  assert.deepEqual(testRadar.skyline, testSkyline, "skyline set");
  assert.equal(testRadar.scrollX, 0, "scrollX set");
  assert.equal(testRadar.scrollY, 0, "scrollY set");
  assert.equal(testRadar.posX, 0, "posX set");
  assert.equal(testRadar.posY, 0, "posY set");
  assert.equal(testRadar.minimumMovement, 30, "minimumMovement set");
  assert.equal(testRadar.resizeDebounce, 128, "resizeDebounce set");
  assert.notOk(testRadar.isTracking, "isTracking set");

});

test('Satellite Zones', (assert) => {

  assert.expect(6);

  let satelliteA = new Satellite(assert.componentA);
  let satelliteAZones = assert.radar.getSatelliteZones(satelliteA);

  let satelliteB = new Satellite(assert.componentB);
  let satelliteBZones = assert.radar.getSatelliteZones(satelliteB);

  assert.deepEqual(satelliteAZones, {x:1, y:1}, "getSatelliteZones is set");
  assert.equal(assert.radar.getSatelliteXZone(satelliteA), 1, "get X");
  assert.equal(assert.radar.getSatelliteYZone(satelliteA), 1, "get Y");
  assert.deepEqual(satelliteBZones, {x:3, y:3}, "alternate getSatelliteZones is set");
  assert.equal(assert.radar.getSatelliteXZone(satelliteB), 3, "alternate get X");
  assert.equal(assert.radar.getSatelliteYZone(satelliteB), 3, "alternate get Y");

});

test('register and unregister component', (assert) => {

  assert.expect(5);

  assert.equal(assert.radar.satellites[0].element.element, assert.componentA.element, "component is added to array when registered");
  assert.equal(assert.radar.satellites.length, 2, "2 items are added to satellites array");

  assert.radar.satellites.forEach(function(satellite) {
    satellite.destroy = function() {
      assert.ok(true, "destroy hook is called");
    };
  });

  assert.radar.unregister(assert.componentA);
  assert.radar.unregister(assert.componentB);

  assert.deepEqual(assert.radar.satellites, [], "component is removed from array when unregistered");

});

test('isEarthquake', (assert) => {

  assert.expect(2);

  assert.ok(assert.radar.isEarthquake(5, 50), "Earthquake has happened");
  assert.notOk(assert.radar.isEarthquake(5, 10), "Earthquake hasn't happened");

});

test('_resize', (assert) => {

  assert.expect(2);

  assert.radar.satellites.forEach(function(satellite) {
    satellite.resize = function() {
      assert.ok(true, "resize hook is called");
    };
  });

  assert.radar._resize();

});

test('resizeSatellites', (assert) => {

  assert.expect(3);

  assert.radar.willResizeSatellites = function() {
    assert.ok(true, "willResizeSatellites hook is called");
  };
  assert.radar._resize = function() {
    assert.ok(true, "_resize hook is called");
  };
  assert.radar.didResizeSatellites = function() {
    assert.ok(true, "didResizeSatellites hook is called");
  };

  assert.radar.resizeSatellites();

});

test('updateSkyline', (assert) => {

  assert.expect(1);

  assert.planetBDiv.style.width = `${(RELATIVE_UNIT / 2)}px`;
  assert.planetBDiv.style.height = `${(RELATIVE_UNIT / 2)}px`;

  assert.radar.updateSkyline();

  assert.deepEqual(assert.radar.skyline.element, assert.planetBDiv, "Skyline is updated");

});

test('shiftSatellites', (assert) => {

  assert.expect(3);

  assert.radar.willShiftSatellites = function() {
    assert.ok(true, "willShiftSatellites hook is called");
  };
  assert.radar._shift = function() {
    assert.ok(true, "_shift hook is called");
  };
  assert.radar.didShiftSatellites = function() {
    assert.ok(true, "didShiftSatellites hook is called");
  };

  assert.radar.shiftSatellites(RELATIVE_UNIT, RELATIVE_UNIT);

});

test('_shift', (assert) => {

  assert.expect(6);

  let skylineTop = assert.radar.skyline.top;
  let skylineBottom = assert.radar.skyline.bottom;
  let skylineLeft = assert.radar.skyline.left;
  let skylineRight = assert.radar.skyline.right;

  assert.radar.satellites.forEach(function(satellite) {
    satellite.shift = function() {
      assert.ok(true, "shift hook is called on each satellite");
    };
  });

  assert.radar._shift(RELATIVE_UNIT, RELATIVE_UNIT);

  assert.equal(assert.radar.skyline.bottom, skylineBottom - RELATIVE_UNIT, "Skyline bottom updated");
  assert.equal(assert.radar.skyline.top, skylineTop - RELATIVE_UNIT, "Skyline top updated");
  assert.equal(assert.radar.skyline.left, skylineLeft - RELATIVE_UNIT, "Skyline left updated");
  assert.equal(assert.radar.skyline.right, skylineRight - RELATIVE_UNIT, "Skyline right updated");

});

test('silentNight', (assert) => {

  assert.expect(7);

  assert.planetBDiv.style.top = `${(RELATIVE_UNIT)}px`;
  assert.planetBDiv.style.left = `${(RELATIVE_UNIT)}px`;
  assert.radar.rebuild = function() {
    assert.ok(true, "rebuild hook is called");
  };

  assert.radar.silentNight();

  assert.equal(assert.radar.scrollY, 0, "scroll Y correctly set");
  assert.equal(assert.radar.scrollX, 0, "scroll X correctly set");
  assert.equal(assert.radar.skyline.left, RELATIVE_UNIT, "skyline left correctly set");
  assert.equal(assert.radar.skyline.right, 3 * RELATIVE_UNIT, "skyline right correctly set");
  assert.equal(assert.radar.skyline.top, RELATIVE_UNIT, "skyline top correctly set");
  assert.equal(assert.radar.skyline.bottom, 3 * RELATIVE_UNIT, "skyline bottom correctly set");
});

test('rebuild', (assert) => {

  assert.expect(4);

  assert.radar.satellites.forEach(function(satellite) {
    satellite.geography.setState = function() {
      assert.ok(true, "setState hook is called for each Satellite's geography");
    };
  });

  assert.radar.posY = RELATIVE_UNIT;
  assert.radar.posX = RELATIVE_UNIT;

  assert.radar.rebuild();

  assert.equal(assert.radar.posX, 0, "posX reset");
  assert.equal(assert.radar.posY, 0, "posY reset");

});

test('filterMovement detects it should shift', (assert) => {

  assert.expect(3);

  assert.radar.scrollY = RELATIVE_UNIT;
  assert.radar.scrollX = RELATIVE_UNIT;
  assert.radar.shiftSatellites = function() {
    assert.ok(true, "shiftSatellites called in filterMovement");
  };

  assert.radar.filterMovement();

  assert.equal(assert.radar.scrollX, 0, "scroll X correctly set");
  assert.equal(assert.radar.scrollY, 0, "scroll Y correctly set");

});

test('filterMovement detects it should not shift', (assert) => {

  assert.expect(2);

  assert.radar.scrollY = 10;
  assert.radar.scrollX = 10;
  assert.radar.shiftSatellites = function() {
    assert.ok(false, "shiftSatellites unnecessarily called in filterMovement");
  };

  assert.radar.filterMovement();

  assert.equal(assert.radar.scrollX, 10, "scroll X not change");
  assert.equal(assert.radar.scrollY, 10, "scroll Y not change");

});

test('updateScrollPosition detects it should adjust', (assert) => {

  assert.expect(3);

  assert.radar.posY = RELATIVE_UNIT;
  assert.radar.posX = RELATIVE_UNIT;
  assert.radar.adjustPosition = function() {
    assert.ok(true, "adjustPosition called in updateScrollPosition");
  };

  assert.radar.updateScrollPosition();
  assert.equal(assert.radar.posX, 0, "pos X correctly set");
  assert.equal(assert.radar.posY, 0, "pos Y correctly set");

});

test('updateScrollPosition detects it should not adjust', (assert) => {

  assert.expect(2);

  assert.radar.posY = 10;
  assert.radar.posX = 10;
  assert.radar.adjustPosition = function() {
    assert.ok(false, "adjustPosition should not be called in updateScrollPosition");
  };

  assert.radar.updateScrollPosition();
  assert.equal(assert.radar.posX, 10, "pos X correctly set");
  assert.equal(assert.radar.posY, 10, "pos Y correctly set");

});

test('_adjustPosition', (assert) => {

  assert.expect(5);

  assert.radar._shift = function() {
    assert.ok(true, "_shift hook is called");
  };

  assert.radar._adjustPosition(10,10);

  assert.equal(assert.radar.planet.top, RELATIVE_UNIT - 10, "Top is adjusted");
  assert.equal(assert.radar.planet.bottom, RELATIVE_UNIT * 2 - 10, "Bottom is adjusted");
  assert.equal(assert.radar.planet.left, RELATIVE_UNIT - 10, "Left is adjusted");
  assert.equal(assert.radar.planet.right, RELATIVE_UNIT * 2 - 10, "Right is adjusted");

});

test('adjustPosition', (assert) => {

  assert.expect(3);

  assert.radar.willAdjustPosition = function() {
    assert.ok(true, "willAdjustPosition hook is called");
  };
  assert.radar._adjustPosition = function() {
    assert.ok(true, "_adjustPosition hook is called");
  };
  assert.radar.didAdjustPosition = function() {
    assert.ok(true, "didAdjustPosition hook is called");
  };

  assert.radar.adjustPosition(10, 10);

});

test('_teardownHooks', (assert) => {

  assert.expect(6);

  assert.radar._teardownHooks();

  assert.equal(assert.radar.willShiftSatellites, null, "willShiftSatellites is null");
  assert.equal(assert.radar.didShiftSatellites, null, "didShiftSatellites is null");
  assert.equal(assert.radar.willResizeSatellites, null, "willResizeSatellites is null");
  assert.equal(assert.radar.didResizeSatellites, null, "didResizeSatellites is null");
  assert.equal(assert.radar.willAdjustPosition, null, "willAdjustPosition is null");
  assert.equal(assert.radar.didAdjustPosition, null, "didAdjustPosition is null");

});

test('destroy', (assert) => {

  assert.expect(12);

  assert.radar._teardownHandlers = function() {
    assert.ok(true, "_teardownHandlers hook is called");
  };
  assert.radar._teardownHooks = function() {
    assert.ok(true, "_teardownHooks hook is called");
  };
  assert.radar.satellites.forEach(function(satellite) {
    satellite.destroy = function() {
      assert.ok(true, "satellite.destroy hook is called");
    };
  });
  assert.radar.planet.destroy = function() {
    assert.ok(true, "planet.destroy hook is called");
  };
  assert.radar.skyline.destroy = function() {
    assert.ok(true, "skyline.destroy hook is called");
  };

  assert.radar.destroy();

  assert.equal(assert.radar.satellites, null, "satellites is null");
  assert.equal(assert.radar.telescope, null, "telescope is null");
  assert.equal(assert.radar.sky, null, "sky is null");
  assert.equal(assert.radar.planet, null, "planet is null");
  assert.equal(assert.radar.scrollContainer, null, "scrollContainer is null");
  assert.equal(assert.radar.skyline, null, "skyline is null");

});
