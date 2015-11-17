import { module, test } from 'qunit';
import Geography from 'smoke-and-mirrors/models/geography';

test('state should be properly set by window', (assert) => {

  let geography = new Geography(window);
  let state = geography.getState();
  assert.ok(state.top === 0 && state.bottom > 0);

});

test('destroy method properly destroys geography', (assert) => {

  let geography = new Geography(window);
  geography.destroy();

  assert.notOk(geography.element);

});

module('Page Elements', {
  beforeEach: (assert) => {
    var planetADiv = document.createElement('div');
    planetADiv.style.height = "100px";
    planetADiv.style.width = "100px";
    planetADiv.style.position = "absolute";
    document.body.appendChild(planetADiv);
    assert.planetADiv = planetADiv;

    var planetBDiv = document.createElement('div');
    planetBDiv.style.height = "100px";
    planetBDiv.style.width = "100px";
    planetBDiv.style.position = "absolute";
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

test('geography sets the state for an element on the page', (assert) => {

  let geography = new Geography(assert.planetADiv);
  let state = geography.getState();

  assert.equal(state.width, 100);
  assert.equal(state.height, 100);

});

test('setState updates the elements of a geography class', (assert) => {

  let geography = new Geography(window);
  let planetA = new Geography(assert.planetADiv);
  geography.setState(planetA);

  assert.equal(geography.getState().width, 100);

});

test('getZones for element offset right as expected', (assert) => {

  assert.planetBDiv.style.marginLeft = "150px";
  document.body.appendChild(assert.planetBDiv);

  let planetA = new Geography(assert.planetADiv);
  let planetB = new Geography(assert.planetBDiv);

  var result = planetA.getZones(planetB);

  assert.equal(result.zoneX, 0);
  assert.equal(result.zoneY, -3);

});

test('getZones for element the same size and position as another planet', (assert) => {

  assert.planetBDiv.style.height = "100px";
  document.body.appendChild(assert.planetBDiv);

  let planetA = new Geography(assert.planetADiv);
  let planetB = new Geography(assert.planetBDiv);

  var result = planetA.getZones(planetB);

  assert.equal(result.zoneX, 0);
  assert.equal(result.zoneY, 0);

});

test('getZones for element slightly smaller and in same position as another planet', (assert) => {

  assert.planetBDiv.style.height = "99.99px";
  assert.planetBDiv.style.width = "99.99px";
  document.body.appendChild(assert.planetBDiv);

  let planetA = new Geography(assert.planetADiv);
  let planetB = new Geography(assert.planetBDiv);

  var result = planetA.getZones(planetB);

  assert.equal(result.zoneX, 0);
  assert.equal(result.zoneY, 0);

});

test('getZones for element slightly larger and in same position as another planet', (assert) => {

  assert.planetBDiv.style.height = "100.01px";
  assert.planetBDiv.style.width = "100.01px";
  document.body.appendChild(assert.planetBDiv);

  let planetA = new Geography(assert.planetADiv);
  let planetB = new Geography(assert.planetBDiv);

  var result = planetA.getZones(planetB);

  assert.equal(result.zoneX, 1);
  assert.equal(result.zoneY, 1);

});
