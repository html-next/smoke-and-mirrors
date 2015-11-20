import { module, test } from 'qunit';
import ListSatellite from 'smoke-and-mirrors/models/list-satellite';

const RELATIVE_UNIT = 100;
let App = {};

module('Unit | Model | ListSatellite', {

  beforeEach(assert) {
    App.planetADiv = document.createElement('div');
    document.body.appendChild(App.planetADiv);
    App.planetBDiv = document.createElement('div');
    document.body.appendChild(App.planetBDiv);

    App.componentA = { element: App.planetADiv };
    App.componentB = { element: App.planetBDiv };
  },

  afterEach(assert) {
    App.planetADiv.parentNode.removeChild(App.planetADiv);
    App.planetBDiv.parentNode.removeChild(App.planetBDiv);
    App = {};
  }

});

test('should build correctly', function(assert) {

  assert.expect(4);

  let testListSatellite = new ListSatellite(App.componentA, [App.componentA, App.componentB]);
  assert.equal(testListSatellite.component, App.componentA, "compenent set");
  assert.equal(testListSatellite.element, App.planetADiv, "element set");
  assert.equal(testListSatellite.radar, undefined, "radar initialized and not set");
  assert.deepEqual(testListSatellite.list, [App.componentA, App.componentB], "list set");

});

test('next and prev return null when only one component', function(assert) {

  let testListSatellite = new ListSatellite(App.componentA, [App.componentA]);

  assert.equal(testListSatellite.next(), null, "no next element");
  assert.equal(testListSatellite.prev(), null, "no prev element");

});
