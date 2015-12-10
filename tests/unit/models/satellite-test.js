import { module, test } from 'qunit';
import Radar from 'smoke-and-mirrors/models/radar';
import Geography from 'smoke-and-mirrors/models/geography'
import Satellite from 'smoke-and-mirrors/models/satellite'

const RELATIVE_UNIT = 100;
let App = {};

module('Unit | Model | Radar', {

  beforeEach() {

    App.planetADiv = document.createElement('div');

    App.planetADiv.style.height = `${RELATIVE_UNIT}px`;
    App.planetADiv.style.width = `${RELATIVE_UNIT}px`;
    App.planetADiv.style.position = 'absolute';
    App.planetADiv.style.top = `${RELATIVE_UNIT}px`;
    App.planetADiv.style.left = `${RELATIVE_UNIT}px`;
    document.body.appendChild(App.planetADiv);

    App.planetBDiv = document.createElement('div');

    App.planetBDiv.style.height = `${RELATIVE_UNIT * 2}px`;
    App.planetBDiv.style.width = `${RELATIVE_UNIT * 2}px`;
    App.planetBDiv.style.position = 'absolute';
    App.planetBDiv.style.top = `${(RELATIVE_UNIT * 2)}px`;
    App.planetBDiv.style.left = `${(RELATIVE_UNIT * 2)}px`;
    document.body.appendChild(App.planetBDiv);

    App.radar = new Radar({
      telescope: App.planetADiv,
      sky: App.planetBDiv
    });

    App.componentA = { element: App.planetADiv };
    App.radar.register(App.componentA);

    App.componentB = { element: App.planetBDiv };
    App.radar.register(App.componentB);

  },

  afterEach() {
    App.planetADiv.parentNode.removeChild(App.planetADiv);
    App = {};
  }

});

test('create empty radar', function(assert) {

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

test('should build correctly with a state', function(assert) {

  assert.expect(13);

  let testPlanet = new Geography(App.planetADiv);
  let testSkyline = new Geography(App.planetBDiv);
  let state = {
    telescope: App.planetADiv,
    sky: App.planetBDiv,
    minimumMovement: 30,
    resizeDebounce: 128,
    isTracking: false
  };
  let testRadar = new Radar(state);

  assert.deepEqual(testRadar.satellites, [], "satellites set");
  assert.equal(testRadar.telescope, App.planetADiv, "telescope set");
  assert.equal(testRadar.sky, App.planetBDiv, "sky set");
  assert.deepEqual(testRadar.planet, testPlanet, "planet set");
  assert.deepEqual(testRadar.scrollContainer, App.planetADiv, "scrollContainer set");
  assert.deepEqual(testRadar.skyline, testSkyline, "skyline set");
  assert.equal(testRadar.scrollX, 0, "scrollX set");
  assert.equal(testRadar.scrollY, 0, "scrollY set");
  assert.equal(testRadar.posX, 0, "posX set");
  assert.equal(testRadar.posY, 0, "posY set");
  assert.equal(testRadar.minimumMovement, 30, "minimumMovement set");
  assert.equal(testRadar.resizeDebounce, 128, "resizeDebounce set");
  assert.notOk(testRadar.isTracking, "isTracking set");

});

test('Satellite Zones', function(assert) {

  assert.expect(6);

  let satelliteA = new Satellite(App.componentA);
  let satelliteAZones = App.radar.getSatelliteZones(satelliteA);

  let satelliteB = new Satellite(App.componentB);
  let satelliteBZones = App.radar.getSatelliteZones(satelliteB);

  assert.deepEqual(satelliteAZones, {x:1, y:1}, "getSatelliteZones is set");
  assert.equal(App.radar.getSatelliteXZone(satelliteA), 1, "get X");
  assert.equal(App.radar.getSatelliteYZone(satelliteA), 1, "get Y");
  assert.deepEqual(satelliteBZones, {x:3, y:3}, "alternate getSatelliteZones is set");
  assert.equal(App.radar.getSatelliteXZone(satelliteB), 3, "alternate get X");
  assert.equal(App.radar.getSatelliteYZone(satelliteB), 3, "alternate get Y");

});

test('register and unregister component', function(assert) {

  assert.expect(5);

  assert.deepEqual(App.radar.satellites[0].component, App.componentA, "component is added to array when registered");
  assert.equal(App.radar.satellites.length, 2, "2 items are added to satellites array");

  App.radar.satellites.forEach(function(satellite) {
    satellite.destroy = function() {
      assert.ok(true, "destroy hook is called");
    };
  });

  App.radar.unregister(App.componentA);
  App.radar.unregister(App.componentB);

  assert.deepEqual(App.radar.satellites, [], "component is removed from array when unregistered");

});

test('isEarthquake', function(assert) {

  assert.expect(2);

  assert.ok(App.radar.isEarthquake(5, 50), "Earthquake has happened");
  assert.notOk(App.radar.isEarthquake(5, 10), "Earthquake hasn't happened");

});

test('_resize', function(assert) {

  assert.expect(2);

  App.radar.satellites.forEach(function(satellite) {
    satellite.resize = function() {
      assert.ok(true, "resize hook is called");
    };
  });

  App.radar._resize();

});

test('resizeSatellites', function(assert) {

  assert.expect(3);

<<<<<<< HEAD
  let component = {
    element: App.planetADiv,
    registerSatellite() {
      assert.ok(true, 'The Component registerSatellite hook is called');
    }
  };
  let satellite = new Satellite(component);
=======
  App.radar.willResizeSatellites = function() {
    assert.ok(true, "willResizeSatellites hook is called");
  };
  App.radar._resize = function() {
    assert.ok(true, "_resize hook is called");
  };
  App.radar.didResizeSatellites = function() {
    assert.ok(true, "didResizeSatellites hook is called");
  };
>>>>>>> Fix errors scrolling backward issues in Radar.SilentNight

  App.radar.resizeSatellites();

});

test('updateSkyline', function(assert) {

  assert.expect(1);

  App.planetBDiv.style.width = `${(RELATIVE_UNIT / 2)}px`;
  App.planetBDiv.style.height = `${(RELATIVE_UNIT / 2)}px`;

  App.radar.updateSkyline();

  assert.deepEqual(App.radar.skyline.element, App.planetBDiv, "Skyline is updated");

});

test('shiftSatellites', function(assert) {

  assert.expect(5);

<<<<<<< HEAD
  let component = { element: App.planetADiv };
  let satellite = new Satellite(component);
  satellite.heightDidChange = function() {
    assert.ok(true, "heightDidChange hook called");
  };
  satellite.widthDidChange = function() {
    assert.ok(true, "widthDidChange hook called");
=======
  App.radar.willShiftSatellites = function() {
    assert.ok(true, "willShiftSatellites hook is called");
  };
  App.radar._shift = function() {
    assert.ok(true, "_shift hook is called");
  };
  App.radar.didShiftSatellites = function() {
    assert.ok(true, "didShiftSatellites hook is called");
>>>>>>> Fix errors scrolling backward issues in Radar.SilentNight
  };

  App.radar.shiftSatellites(RELATIVE_UNIT, RELATIVE_UNIT);

});

test('_shift', function(assert) {

  assert.expect(6);

  let skylineTop = App.radar.skyline.top;
  let skylineBottom = App.radar.skyline.bottom;
  let skylineLeft = App.radar.skyline.left;
  let skylineRight = App.radar.skyline.right;

<<<<<<< HEAD
  assert.equal(result.dX, -(RELATIVE_UNIT / 2), 'width is adjusted -50px');
  assert.equal(result.dY, -(RELATIVE_UNIT / 2), 'height is not adjusted');

});

test('shift', function(assert) {
=======
  App.radar.satellites.forEach(function(satellite) {
    satellite.shift = function() {
      assert.ok(true, "shift hook is called on each satellite");
    }
  });

  App.radar._shift(RELATIVE_UNIT, RELATIVE_UNIT);

  assert.equal(App.radar.skyline.bottom, skylineBottom - RELATIVE_UNIT, "Skyline bottom updated");
  assert.equal(App.radar.skyline.top, skylineTop - RELATIVE_UNIT, "Skyline top updated");
  assert.equal(App.radar.skyline.left, skylineLeft - RELATIVE_UNIT, "Skyline left updated");
  assert.equal(App.radar.skyline.right, skylineRight - RELATIVE_UNIT, "Skyline right updated");

});

test('silentNight', function(assert) {

  assert.expect(7);

  App.planetBDiv.style.top = `${(RELATIVE_UNIT)}px`;
  App.planetBDiv.style.left = `${(RELATIVE_UNIT)}px`;
  App.radar.rebuild = function() {
    assert.ok(true, "rebuild hook is called");
  };

  App.radar.silentNight();

  assert.equal(App.radar.scrollY, 0, "scroll Y correctly set");
  assert.equal(App.radar.scrollX, 0, "scroll X correctly set");
  assert.equal(App.radar.skyline.left, RELATIVE_UNIT, "skyline left correctly set");
  assert.equal(App.radar.skyline.right, 3 * RELATIVE_UNIT, "skyline right correctly set");
  assert.equal(App.radar.skyline.top, RELATIVE_UNIT, "skyline top correctly set");
  assert.equal(App.radar.skyline.bottom, 3 * RELATIVE_UNIT, "skyline bottom correctly set");
});

test('rebuild', function(assert) {

  assert.expect(4);

  App.radar.satellites.forEach(function(satellite) {
    satellite.geography.setState = function() {
      assert.ok(true, "setState hook is called for each Satellite's geography");
    };
  });

  App.radar.posY = RELATIVE_UNIT;
  App.radar.posX = RELATIVE_UNIT;

  App.radar.rebuild();

  assert.equal(App.radar.posX, 0, "posX reset");
  assert.equal(App.radar.posY, 0, "posY reset");

});

test('filterMovement detects it should shift', function(assert) {

  assert.expect(3);

  App.radar.scrollY = RELATIVE_UNIT;
  App.radar.scrollX = RELATIVE_UNIT;
  App.radar.shiftSatellites = function() {
    assert.ok(true, "shiftSatellites called in filterMovement");
  };

  App.radar.filterMovement();

  assert.equal(App.radar.scrollX, 0, "scroll X correctly set");
  assert.equal(App.radar.scrollY, 0, "scroll Y correctly set");

});

test('filterMovement detects it should not shift', function(assert) {
>>>>>>> Fix errors scrolling backward issues in Radar.SilentNight

  assert.expect(3);

  App.radar.scrollY = 10;
  App.radar.scrollX = 10;
  App.radar.shiftSatellites = function() {
    assert.ok(false, "shiftSatellites unnecessarily called in filterMovement");
  };

<<<<<<< HEAD
  satellite.willShift = function() {
    assert.ok(true, "willShift hook called");
  }
  satellite._shift = function() {
    assert.ok(true, "_shift hook called");
  }
  satellite.didShift = function() {
    assert.ok(true, "didShift hook called");
  }

  satellite.shift(RELATIVE_UNIT, RELATIVE_UNIT);

});

test('_shift', function(assert) {

  assert.expect(4);

  let component = { element: App.planetADiv };
  let satellite = new Satellite(component);

  satellite._shift(10, 10);

  assert.equal(satellite.geography.left, RELATIVE_UNIT - 9, "left adjusted");
  assert.equal(satellite.geography.right, RELATIVE_UNIT * 2 - 9, "right adjusted");
  assert.equal(satellite.geography.bottom, RELATIVE_UNIT * 2 - 9, "bottom adjusted");
  assert.equal(satellite.geography.top, RELATIVE_UNIT - 9, "top adjusted");
=======
  App.radar.filterMovement();

  assert.equal(App.radar.scrollX, 10, "scroll X not change");
  assert.equal(App.radar.scrollY, 10, "scroll Y not change");
>>>>>>> Fix errors scrolling backward issues in Radar.SilentNight

});

test('updateScrollPosition detects it should adjust', function(assert) {

<<<<<<< HEAD
  assert.expect(5);

  let component = { element: App.planetADiv,
                    unregisterSatellite() {
                      assert.ok(true, 'The Component unregisterSatellite hook is called');
                    }
                  };
  let satellite = new Satellite(component);

  satellite.geography.destroy = function() {
    assert.ok(true, "geography.destroy called");
  };

  satellite.destroy();

  assert.notOk(satellite.geography, 'geography destroyed and set to null');
  assert.notOk(satellite.component, 'component set to null');
  assert.notOk(satellite.element, 'element is set to null');
=======
  assert.expect(3);

  App.radar.posY = RELATIVE_UNIT;
  App.radar.posX = RELATIVE_UNIT;
  App.radar.adjustPosition = function() {
    assert.ok(true, "adjustPosition called in updateScrollPosition");
  }

  App.radar.updateScrollPosition();
  assert.equal(App.radar.posX, 0, "pos X correctly set");
  assert.equal(App.radar.posY, 0, "pos Y correctly set");

});

test('updateScrollPosition detects it should not adjust', function(assert) {

  assert.expect(2);

  App.radar.posY = 10;
  App.radar.posX = 10;
  App.radar.adjustPosition = function() {
    assert.ok(false, "adjustPosition should not be called in updateScrollPosition");
  }

  App.radar.updateScrollPosition();
  assert.equal(App.radar.posX, 10, "pos X correctly set");
  assert.equal(App.radar.posY, 10, "pos Y correctly set");

});

test('_adjustPosition', function(assert) {

  assert.expect(5);

  App.radar._shift = function() {
    assert.ok(true, "_shift hook is called");
  };

  App.radar._adjustPosition(10,10);

  assert.equal(App.radar.planet.top, RELATIVE_UNIT - 10, "Top is adjusted");
  assert.equal(App.radar.planet.bottom, RELATIVE_UNIT * 2 - 10, "Bottom is adjusted");
  assert.equal(App.radar.planet.left, RELATIVE_UNIT - 10, "Left is adjusted");
  assert.equal(App.radar.planet.right, RELATIVE_UNIT * 2 - 10, "Right is adjusted");

});

test('adjustPosition', function(assert) {

  assert.expect(3);

  App.radar.willAdjustPosition = function() {
    assert.ok(true, "willAdjustPosition hook is called");
  };
  App.radar._adjustPosition = function() {
    assert.ok(true, "_adjustPosition hook is called");
  };
  App.radar.didAdjustPosition = function() {
    assert.ok(true, "didAdjustPosition hook is called");
  };

  App.radar.adjustPosition(10, 10);

});

test('_teardownHooks', function(assert) {

  assert.expect(6);

  App.radar._teardownHooks();

  assert.equal(App.radar.willShiftSatellites, null, "willShiftSatellites is null");
  assert.equal(App.radar.didShiftSatellites, null, "didShiftSatellites is null");
  assert.equal(App.radar.willResizeSatellites, null, "willResizeSatellites is null");
  assert.equal(App.radar.didResizeSatellites, null, "didResizeSatellites is null");
  assert.equal(App.radar.willAdjustPosition, null, "willAdjustPosition is null");
  assert.equal(App.radar.didAdjustPosition, null, "didAdjustPosition is null");

});

test('destroy', function(assert) {

  assert.expect(12);

  App.radar._teardownHandlers = function() {
    assert.ok(true, "_teardownHandlers hook is called");
  };
  App.radar._teardownHooks = function() {
    assert.ok(true, "_teardownHooks hook is called");
  };
  App.radar.satellites.forEach(function(satellite) {
    satellite.destroy = function() {
      assert.ok(true, "satellite.destroy hook is called");
    };
  });
  App.radar.planet.destroy = function() {
    assert.ok(true, "planet.destroy hook is called");
  };
  App.radar.skyline.destroy = function() {
    assert.ok(true, "skyline.destroy hook is called");
  };

  App.radar.destroy();

  assert.equal(App.radar.satellites, null, "satellites is null");
  assert.equal(App.radar.telescope, null, "telescope is null");
  assert.equal(App.radar.sky, null, "sky is null");
  assert.equal(App.radar.planet, null, "planet is null");
  assert.equal(App.radar.scrollContainer, null, "scrollContainer is null");
  assert.equal(App.radar.skyline, null, "skyline is null");
>>>>>>> Fix errors scrolling backward issues in Radar.SilentNight

});
