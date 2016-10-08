import { module, test } from 'qunit';
import Geography from 'smoke-and-mirrors/-private/radar/models/geography';

const RELATIVE_UNIT = 100;

module('Unit | Model | Geography', {

  beforeEach: (assert) => {
    const planetADiv = document.createElement('div');

    planetADiv.style.height = `${RELATIVE_UNIT}px`;
    planetADiv.style.width = `${RELATIVE_UNIT}px`;
    planetADiv.style.position = 'absolute';
    planetADiv.style.top = `${(RELATIVE_UNIT + 1)}px`;
    planetADiv.style.left = `${(RELATIVE_UNIT + 1)}px`;
    document.body.appendChild(planetADiv);
    assert.planetADiv = planetADiv;

    const planetBDiv = document.createElement('div');

    planetBDiv.style.height = `${RELATIVE_UNIT}px`;
    planetBDiv.style.width = `${RELATIVE_UNIT}px`;
    planetBDiv.style.top = '0';
    planetBDiv.style.left = '0';
    planetBDiv.style.position = 'absolute';
    assert.planetBDiv = planetBDiv;
  },

  afterEach: (assert) => {
    assert.planetADiv.parentNode.removeChild(assert.planetADiv);
    assert.planetADiv = null;

    if (assert.planetBDiv.parentNode) {
      assert.planetBDiv.parentNode.removeChild(assert.planetBDiv);
    }

    assert.planetBDiv = null;
  }
});

test('Geography should work with `window`', (assert) => {
  const geography = new Geography(window);
  const state = geography.getState();

  assert.ok(state.top === 0 && state.bottom > 0);
});

test('Geography.destroy() properly tears down the instance.', (assert) => {
  const geography = new Geography(window);

  geography.destroy();
  assert.notOk(geography.element);
});

test('geography sets the state for an element on the page', (assert) => {
  const geography = new Geography(assert.planetADiv);
  const state = geography.getState();
  assert.expect(12);

  assert.equal(state.width, RELATIVE_UNIT, 'planetA width is 100');
  assert.equal(state.height, RELATIVE_UNIT, 'planetA height is 100');
  assert.equal(state.left, RELATIVE_UNIT + 1, 'planetA left is 101');
  assert.equal(state.right, 2 * RELATIVE_UNIT + 1, 'planetA right is 201');
  assert.equal(state.top, RELATIVE_UNIT + 1, 'planetA top is 101');
  assert.equal(state.bottom, 2 * RELATIVE_UNIT + 1, 'planetA bottom is 201');

  // test planet B
  assert.planetBDiv.style.left = '0';
  assert.planetBDiv.style.top = '0';
  document.body.appendChild(assert.planetBDiv);

  const geographyB = new Geography(assert.planetBDiv);
  const stateB = geographyB.getState();

  assert.equal(stateB.width, RELATIVE_UNIT, 'planetB width is 100');
  assert.equal(stateB.height, RELATIVE_UNIT, 'planetB height is 100');
  assert.equal(stateB.left, 0, 'planetB left is 0');
  assert.equal(stateB.right, RELATIVE_UNIT, 'planetB right is 100');
  assert.equal(stateB.top, 0, 'planetB top is 0');
  assert.equal(stateB.bottom, RELATIVE_UNIT, 'planetB bottom is 100');

});

test('setState updates the elements of a geography class', (assert) => {
  const geography = new Geography(window);
  const planetA = new Geography(assert.planetADiv);
  geography.setState(planetA);

  assert.equal(geography.getState().width, RELATIVE_UNIT);
});

test('getZones correctly determines the X (horizontal) distance and zone.', (assert) => {
  assert.expect(6);

  // test before
  assert.planetBDiv.style.left = '0';
  assert.planetBDiv.style.top = `${RELATIVE_UNIT}px`;
  document.body.appendChild(assert.planetBDiv);

  const planetA = new Geography(assert.planetADiv);
  const planetB = new Geography(assert.planetBDiv);
  let result = planetA.getZones(planetB);

  assert.equal(result.distanceX, -1, 'The satellite is 1px to the left');
  assert.equal(result.zoneX, -1, 'The satellite is 1 zone to the left');

  // test ontop of
  assert.planetBDiv.style.left = `${(RELATIVE_UNIT + 1)}px`;

  planetB.setState();
  result = planetA.getZones(planetB);

  assert.equal(result.distanceX, 0, 'The satellite is 0px away');
  assert.equal(result.zoneX, 0, 'The satellite is 0 zones away');

  // test after
  assert.planetBDiv.style.left = `${(2 * RELATIVE_UNIT + 2)}px`;

  planetB.setState();
  result = planetA.getZones(planetB);

  assert.equal(result.distanceX, 1, 'The satellite is 1px to the right');
  assert.equal(result.zoneX, 1, 'The satellite is 1 zone to the right');
});

test('getZones correctly determines the Y (vertical) distance and zone.', (assert) => {
  assert.expect(6);

  // test before
  assert.planetBDiv.style.top = '0';
  assert.planetBDiv.style.left = `${RELATIVE_UNIT}px`;
  document.body.appendChild(assert.planetBDiv);

  const planetA = new Geography(assert.planetADiv);
  const planetB = new Geography(assert.planetBDiv);
  let result = planetA.getZones(planetB);

  assert.equal(result.distanceY, -1, 'The satellite is 1px above');
  assert.equal(result.zoneY, -1, 'The satellite is 1 zone above');

  // test ontop of
  assert.planetBDiv.style.top = `${(RELATIVE_UNIT + 1)}px`;

  planetB.setState();
  result = planetA.getZones(planetB);

  assert.equal(result.distanceY, 0, 'The satellite is 0px away');
  assert.equal(result.zoneY, 0, 'The satellite is 0 zones away');

  // test after
  assert.planetBDiv.style.top = `${(2 * RELATIVE_UNIT + 2)}px`;

  planetB.setState();
  result = planetA.getZones(planetB);

  assert.equal(result.distanceY, 1, 'The satellite is 1px below');
  assert.equal(result.zoneY, 1, 'The satellite is 1 zone below');
});

test('getZones for element slightly overlaping another planet', (assert) => {
  assert.planetBDiv.style.top = '50px';
  assert.planetBDiv.style.left = '50px';
  document.body.appendChild(assert.planetBDiv);

  const planetA = new Geography(assert.planetADiv);
  const planetB = new Geography(assert.planetBDiv);

  const result = planetA.getZones(planetB);

  assert.equal(result.zoneX, 0, 'Partial Overlap on X results in zone 0');
  assert.equal(result.zoneY, 0, 'Partial Overlap on Y results in zone 0');
});

test('getZones for element slightly larger and in same position as another planet', (assert) => {
  assert.planetBDiv.style.height = '102px';
  assert.planetBDiv.style.width = '102px';
  assert.planetBDiv.style.top = '100px';
  assert.planetBDiv.style.left = '100px';
  document.body.appendChild(assert.planetBDiv);

  const planetA = new Geography(assert.planetADiv);
  const planetB = new Geography(assert.planetBDiv);

  const result = planetA.getZones(planetB);

  assert.equal(result.zoneX, 0, 'Fully encompassing X results in zone 0');
  assert.equal(result.zoneY, 0, 'Fully encompassing Y results in zone 0');
});
