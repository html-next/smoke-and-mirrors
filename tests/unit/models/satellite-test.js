import { module, test } from 'qunit';
import Satellite from 'smoke-and-mirrors/models/satellite';

const RELATIVE_UNIT = 100;

module('Unit | Model | Satellite', {

  beforeEach(assert) {
    // stubbed component for the tests
    let div = document.createElement('div');

    div.style.width = `${RELATIVE_UNIT}px`;
    div.style.height = `${RELATIVE_UNIT}px`;
    div.style.position = "absolute";
    div.style.top = `${(RELATIVE_UNIT + 1)}px`;
    div.style.left = `${(RELATIVE_UNIT + 1)}px`;
    document.body.appendChild(div);

    assert.component = {
      element: div,
      dimensions: {}
    };
  },

  afterEach(assert) {
    assert.component.element.parentNode.removeChild(assert.component.element);
    assert.component.element = null;
  }

});

test('Satellite should build correctly', (assert) => {
  assert.expect(1);

  let satellite = new Satellite(assert.component);

  assert.equal(satellite.element.element, assert.component.element, "The satellite's VirtualElement was set from the component's element");
});

test('resize returns adjustment', (assert) => {
  assert.expect(5);

  let satellite = new Satellite(assert.component);

  satellite.heightDidChange = function() {
    assert.ok(true, "heightDidChange hook called");
  };
  satellite.widthDidChange = function() {
    assert.ok(true, "widthDidChange hook called");
  };

  let noChangeResult = satellite.resize();

  assert.equal(noChangeResult, null, 'nothing has changed');

  assert.component.element.style.width = `${(RELATIVE_UNIT / 2)}px`;
  assert.component.element.style.height = `${(RELATIVE_UNIT / 2)}px`;

  let result = satellite.resize();

  assert.equal(result.dX, -(RELATIVE_UNIT / 2), 'width is adjusted -50px');
  assert.equal(result.dY, -(RELATIVE_UNIT / 2), 'height is not adjusted');

});

test('shift', (assert) => {

  assert.expect(3);

  let component = { element: assert.planetADiv };
  let satellite = new Satellite(component);

  satellite.willShift = function() {
    assert.ok(true, "willShift hook called");
  };
  satellite._shift = function() {
    assert.ok(true, "_shift hook called");
  };
  satellite.didShift = function() {
    assert.ok(true, "didShift hook called");
  };

  satellite.shift(RELATIVE_UNIT, RELATIVE_UNIT);

});

test('_shift', (assert) => {
  assert.expect(4);

  let satellite = new Satellite(assert.component);

  satellite._shift(10, 10);

  assert.equal(satellite.geography.left, RELATIVE_UNIT - 9, "left adjusted");
  assert.equal(satellite.geography.right, RELATIVE_UNIT * 2 - 9, "right adjusted");
  assert.equal(satellite.geography.bottom, RELATIVE_UNIT * 2 - 9, "bottom adjusted");
  assert.equal(satellite.geography.top, RELATIVE_UNIT - 9, "top adjusted");

});

test('destroy is destructive', (assert) => {
  assert.expect(3);

  let satellite = new Satellite(assert.component);

  satellite.geography.destroy = function() {
    assert.ok(true, 'geography.destroy called');
  };

  satellite.destroy();

  assert.notOk(satellite.geography, 'geography destroyed and set to null');
  assert.notOk(satellite.element, 'element is set to null');

});
