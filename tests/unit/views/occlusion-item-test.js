import Ember from 'ember';
import OcclusionView from "smoke-and-mirrors/components/occlusion-collection/occlusion-item.view";
import {
  module,
  test
} from 'qunit';

const {
  View,
  run
} = Ember;


function append(view) {
  run(function () {
    view.appendTo('#ember-testing');
  });
}

function destroy(view) {
  run(function () {
    view.destroy();
  });
}

// TODO: register the view on the container without exposing it to addon consumers
// so that ember test helpers can be used

var view;

// Track which transition methods have been called
var didTransition;

var states = ['culled', 'cached', 'hidden', 'visible'];

var transitionStubs = {
  _ov_prepare () {
    didTransition._ov_prepare = true;
  },
  _ov_insert () {
    didTransition._ov_insert = true;
  },
  _ov_reveal () {
    didTransition._ov_reveal = true;
  },
  _ov_obscure () {
    didTransition._ov_obscure = true;
  },
  _ov_remove () {
    didTransition._ov_remove = true;
  },
  _ov_teardown () {
    didTransition._ov_teardown = true;
  },
};


module('OcclusionView: _setState', {
  beforeEach: function () {
    didTransition = {
      _ov_prepare: false,
      _ov_insert: false,
      _ov_reveal: false,
      _ov_obscure: false,
      _ov_remove: false,
      _ov_teardown: false
    };

    view = OcclusionView.create(transitionStubs);

    append(view);
  },

  afterEach: function () {
    destroy(view);
  }
});

test('transitioning from \'culled\' to \'visible\' should call the corresponding methods', function(assert) {
  assert.expect(2);

  assert.equal(view.viewState, 'culled', 'initial viewState should be \'culled\'');

  run(function () {
    view._setState('visible');
  });

  assert.deepEqual(didTransition, {
    _ov_prepare: true,
    _ov_insert: true,
    _ov_reveal: true,
    _ov_obscure: false,
    _ov_remove: false,
    _ov_teardown: false
  });
});

test('transitioning from \'visible\' to \'culled\' should call the corresponding methods', function(assert) {
  assert.expect(2);

  run(function () {
    view.set('viewState', 'visible');
  });

  assert.equal(view.viewState, 'visible', 'initial viewState should be \'visible\'');

  run(function () {
    view._setState('culled');
  });

  assert.deepEqual(didTransition, {
    _ov_prepare: false,
    _ov_insert: false,
    _ov_reveal: false,
    _ov_obscure: true,
    _ov_remove: true,
    _ov_teardown: true
  });
});

test('transitioning from stateA to stateB should not call stateA\'s transition method', function(assert) {
  assert.expect(2);

  run(function () {
    view.set('viewState', 'cached');
  });

  assert.equal(view.viewState, 'cached', 'initial viewState should be \'cached\'');

  run(function () {
    view._setState('hidden');
  });

  assert.deepEqual(didTransition, {
    _ov_prepare: false,
    _ov_insert: true,
    _ov_reveal: false,
    _ov_obscure: false,
    _ov_remove: false,
    _ov_teardown: false
  });
});

module('OcclusionView: caching and childViews', {
  beforeEach: function () {
    view = OcclusionView.create({
      innerView: 'stub-view',
      container: {
        lookupFactory () {
          return View.extend();
        }
      }
    });

    append(view);
  },

  afterEach: function () {
    destroy(view);
  }
});

test('the innerView should only be cached while in the \'cached\' state', function(assert) {
  assert.expect(4);

  states.forEach(state => {
    run(function () {
      view._setState(state);
    });

    if (state === 'cached') {
      assert.ok(view._cachedView, 'innerView should be cached while in the \'cached\' state');
    } else {
      assert.ok(!view._cachedView, 'innerView should be null when state is not \'cached\'');
    }
  });
});

test('_childViews should only be populated when \'hidden\' or \'visible\'', function(assert) {
  assert.expect(8);

  states.forEach(state => {
    run(function () {
      view._setState(state);
    });

    if (state === 'hidden' || state === 'visible') {
      assert.ok(view._childViews[0], 'childView should be present when \'hidden\' or \'visible\'');
      assert.equal(view._childViews.length, 1, 'there should be only one childView');
    } else {
      assert.ok(!view._childViews[0], 'childView should not be present when \'cached\' or \'culled\'');
      assert.equal(view._childViews.length, 0, 'there shouldn\'t be any childViews');
    }
  });
});

module('OcclusionView: alwaysUseDefaultHeight', {
  beforeEach: function () {
    view = OcclusionView.create({
      defaultHeight: 1000,
      alwaysUseDefaultHeight: true,
      innerView: 'stub-view',
      container: {
        lookupFactory () {
          return View.extend();
        }
      }
    });

    append(view);
  },

  afterEach: function () {
    destroy(view);
  }
});

test('alwaysUseDefaultHeight locks height to the default', function(assert) {
  assert.expect(1);

  run(function () {
    view._setState('visible');
  });

  assert.equal(view.element.height, 1000);
});

