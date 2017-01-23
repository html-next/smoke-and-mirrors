import { module, test } from 'qunit';
import Satellite from 'smoke-and-mirrors/-private/radar/models/satellite';

const RELATIVE_UNIT = 100;
let App = {};

module('Unit | Model | Satellite', {

  beforeEach() {
    App.planetADiv = document.createElement('div');
    App.planetADiv.style.width = `${RELATIVE_UNIT}px`;
    App.planetADiv.style.height = `${RELATIVE_UNIT}px`;
    App.planetADiv.style.position = 'absolute';
    App.planetADiv.style.top = `${(RELATIVE_UNIT + 1)}px`;
    App.planetADiv.style.left = `${(RELATIVE_UNIT + 1)}px`;
    document.body.appendChild(App.planetADiv);
  },

  afterEach() {
    App.planetADiv.parentNode.removeChild(App.planetADiv);
    App = {};
  }

});

test('Satellite should build correctly', (assert) => {

  assert.expect(3);

  let component = {
    element: App.planetADiv,
    registerSatellite() {
      assert.ok(true, 'The Component registerSatellite hook is called');
    }
  };
  let satellite = new Satellite({ component, element: App.planetADiv });

  assert.equal(satellite.component, component, 'component set');
  assert.equal(satellite.element.element, component.element, 'element set');

});

test('resize returns adjustment', (assert) => {

  assert.expect(5);

  let component = { element: App.planetADiv };
  let satellite = new Satellite({ component, element: App.planetADiv });
  satellite.heightDidChange = function() {
    assert.ok(true, 'heightDidChange hook called');
  };
  satellite.widthDidChange = function() {
    assert.ok(true, 'widthDidChange hook called');
  };

  let noChangeResult = satellite.resize();

  assert.equal(noChangeResult, null, 'nothing has changed');

  component.element.style.width = `${(RELATIVE_UNIT / 2)}px`;
  component.element.style.height = `${(RELATIVE_UNIT / 2)}px`;

  let result = satellite.resize();

  assert.equal(result.dX, -(RELATIVE_UNIT / 2), 'width is adjusted -50px');
  assert.equal(result.dY, -(RELATIVE_UNIT / 2), 'height is not adjusted');

});

test('shift', (assert) => {

  assert.expect(3);

  let component = { element: App.planetADiv };
  let satellite = new Satellite({ component, element: App.planetADiv });

  satellite.willShift = function() {
    assert.ok(true, 'willShift hook called');
  };
  satellite._shift = function() {
    assert.ok(true, '_shift hook called');
  };
  satellite.didShift = function() {
    assert.ok(true, 'didShift hook called');
  };

  satellite.shift(RELATIVE_UNIT, RELATIVE_UNIT);

});

test('_shift', (assert) => {

  assert.expect(4);

  let component = { element: App.planetADiv };
  let satellite = new Satellite({ component, element: App.planetADiv });

  satellite._shift(10, 10);

  assert.equal(satellite.geography.left, RELATIVE_UNIT - 9, 'left adjusted');
  assert.equal(satellite.geography.right, RELATIVE_UNIT * 2 - 9, 'right adjusted');
  assert.equal(satellite.geography.bottom, RELATIVE_UNIT * 2 - 9, 'bottom adjusted');
  assert.equal(satellite.geography.top, RELATIVE_UNIT - 9, 'top adjusted');

});

test('destroy is destructive', (assert) => {

  assert.expect(5);

  let component = {
    element: App.planetADiv,
    unregisterSatellite() {
      assert.ok(true, 'The Component unregisterSatellite hook is called');
    }
  };
  let satellite = new Satellite({ component, element: App.planetADiv });

  satellite.geography.destroy = function() {
    assert.ok(true, 'geography.destroy called');
  };

  satellite.destroy();

  assert.notOk(satellite.geography, 'geography destroyed and set to null');
  assert.notOk(satellite.component, 'component set to null');
  assert.notOk(satellite.element, 'element is set to null');

});
