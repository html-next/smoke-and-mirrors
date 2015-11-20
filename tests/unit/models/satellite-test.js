import { module, test } from 'qunit';
import Satellite from 'smoke-and-mirrors/models/satellite';

const RELATIVE_UNIT = 100;
var App = {};

module('Unit | Model | Satellite', {

  beforeEach(assert) {
    App.planetADiv = document.createElement('div');
    App.planetADiv.style.width = RELATIVE_UNIT;
    App.planetADiv.style.height = RELATIVE_UNIT;
    App.planetADiv.style.position = "absolute";
    App.planetADiv.style.top = `${(RELATIVE_UNIT + 1)}px`;
    App.planetADiv.style.left = `${(RELATIVE_UNIT + 1)}px`;
    document.body.appendChild(App.planetADiv);
  },

  afterEach(assert) {
    App.planetADiv.parentNode.removeChild(App.planetADiv);
    App = {};
  }

});

test('Satellite should build correctly', function(assert) {

  assert.expect(3);

  let component = { element: App.planetADiv,
                    registerSatellite() {
                      assert.ok(true, 'The Component registerSatellite hook is called');
                    }
                  };
  let satellite = new Satellite(component);

  assert.equal(satellite.component, component, 'component set');
  assert.equal(satellite.element, component.element, 'element set');

});

test('resize returns adjustment', function(assert) {

  assert.expect(3);

  let component = { element: App.planetADiv };
  let satellite = new Satellite(component);

  let noChangeResult = satellite.resize();

  assert.equal(noChangeResult, null, 'nothing has changed');

  component.element.style.width = `${(RELATIVE_UNIT / 2)}px`;
  component.element.style.height = `${(RELATIVE_UNIT / 2)}px`;

  let result = satellite.resize();

  // Need assertions to test if heightDidChange() and widthDidChange() are called

  assert.equal(result.dX, -(RELATIVE_UNIT / 2), 'width is adjusted -50px');
  assert.equal(result.dY, -(RELATIVE_UNIT / 2), 'height is not adjusted');

});

test('shift adjusts the positions', function(assert) {

  assert.expect(2);

  let component = { element: App.planetADiv };
  let satellite = new Satellite(component);

  satellite.shift(RELATIVE_UNIT, RELATIVE_UNIT);

  assert.equal(satellite.geography.top, 1, "element is now 1px from top");
  assert.equal(satellite.geography.left, 1, "element is now 1px from left");

});

test('destroy is destructive', function(assert) {

  assert.expect(4);

  let component = { element: App.planetADiv,
                    unregisterSatellite() {
                      assert.ok(true, 'The Component unregisterSatellite hook is called');
                    }
                  };
  let satellite = new Satellite(component);
  satellite.destroy();

  assert.notOk(satellite.geography, 'geography destroyed and set to null');
  assert.notOk(satellite.component, 'component set to null');
  assert.notOk(satellite.element, 'element is set to null');

});
