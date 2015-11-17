import { test } from 'qunit';
import Geography from 'smoke-and-mirrors/models/geography';

test('state should be properly set by window', function(assert) {
  assert.expect(2);

  // Predefined by the window
  let geography = new Geography(window);
  let state = geography.getState();
  assert.ok(state.top === 0 && state.bottom > 0);

  let geography2 = new Geography(window);
  var state2 =  { top: 10,
                  left: 10,
                  right: 400,
                  bottom: 400,
                  width: 390,
                  height: 390 };
  geography2.setState(state2);
  assert.equal(geography2.getState().width, 390);

});
