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
    App.planetADiv.style.top = `${(RELATIVE_UNIT + 1)}px`;
    App.planetADiv.style.left = `${(RELATIVE_UNIT + 1)}px`;
    document.body.appendChild(App.planetADiv);

    App.planetBDiv = document.createElement('div');

    App.planetBDiv.style.height = `${RELATIVE_UNIT * 2}px`;
    App.planetBDiv.style.width = `${RELATIVE_UNIT * 2}px`;
    App.planetBDiv.style.position = 'absolute';
    App.planetBDiv.style.top = `${(RELATIVE_UNIT * 2)}px`;
    App.planetBDiv.style.left = `${(RELATIVE_UNIT * 2)}px`;
    document.body.appendChild(App.planetBDiv);

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

  let state = { telescope: App.planetADiv,
                sky: App.planetBDiv,
                minimumMovement: 30,
                resizeDebounce: 128,
                isTracking: false };
  let testRadar = new Radar(state);
  let testPlanet = new Geography(App.planetADiv);
  let testSkyline = new Geography(App.planetBDiv);

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

  let testRadar = new Radar({ telescope: App.planetADiv,
                              sky: App.planetBDiv
                            });

  let componentA = { element: App.planetADiv };
  let satelliteA = new Satellite(componentA);
  let satelliteAZones = testRadar.getSatelliteZones(satelliteA);

  let componentB = { element: App.planetBDiv };
  let satelliteB = new Satellite(componentB);
  let satelliteBZones = testRadar.getSatelliteZones(satelliteB);

  assert.deepEqual(satelliteAZones, {x:1, y:1}, "getSatelliteZones is set");
  assert.equal(testRadar.getSatelliteXZone(satelliteA), 1, "get X");
  assert.equal(testRadar.getSatelliteYZone(satelliteA), 1, "get Y");
  assert.deepEqual(satelliteBZones, {x:2, y:2}, "alternate getSatelliteZones is set");
  assert.equal(testRadar.getSatelliteXZone(satelliteB), 2, "alternate get X");
  assert.equal(testRadar.getSatelliteYZone(satelliteB), 2, "alternate get Y");

});

test('register and unregister component', function(assert) {

  assert.expect(3);
  let testRadar = new Radar({ telescope: App.planetADiv,
                              sky: App.planetBDiv
                            });
  let component = { element: App.planetADiv };

  testRadar.register(component);

  assert.deepEqual(testRadar.satellites[0].component, component, "component is added to array when registered");
  assert.equal(testRadar.satellites.length, 1, "1 item is added to satellites array");

  testRadar.unregister(component);

  assert.deepEqual(testRadar.satellites, [], "component is removed from array when unregistered");

});
