import Ember from "ember";

const {
  guidFor,
  run
  } = Ember;

var ViewportDimensions = {
  height: window.innerHeight,
  width: window.innerWidth
};
var TrackedComponents = Ember.A();
var ScrollPosition = {
  x: document.body.scrollLeft,
  y: document.body.scrollTop
};

function getViewportPosition(rect, zoneRatio) {

  // TODO this makes no sense, should swap based on being above or below
  var distanceX = rect.bottom || rect.top;
  var distanceY = rect.left || rect.right;

  // TODO Zone Ratio
  var zoneX = Math.floor( distanceX / ViewportDimensions.height );
  var zoneY = Math.floor( distanceY / ViewportDimensions.width );

  return {
    zoneX: zoneX,
    zoneY: zoneY,
    distanceX: distanceX,
    distanceY: distanceY
  };

}

function resizeTrackedComponents() {
  TrackedComponents.forEach((item) => {
    item.resize();
  });
}

function updateTrackedComponents() {

  var lastScrollPosition = {
    x: ScrollPosition.x,
    y: ScrollPosition.y
  };

  ScrollPosition.x = document.body.scrollLeft;
  ScrollPosition.y = document.body.scrollTop;

  var dX = lastScrollPosition.x - ScrollPosition.x;
  var dY = lastScrollPosition.y - ScrollPosition.y;

  TrackedComponents.forEach((item) => {
    item.shift(dX, dY);
  });

}

function findComponent(key) {
  return TrackedComponents.find(function(item) {
    return item.get('key') === key;
  });
}

/**!
 * Wrapper Class for the passed in component to
 * cache position and dimensions.
 */
var TrackedItem = Ember.Object.extend({

  component:  null,
  key:        null,
  rect:       null,
  position:   null,
  zoneRatio:  1,

  shift: function(dX, dY) {
    var rect = this.get('rect');
    var changedZone;
    if (dX) {
      rect.left += dX;
      rect.right += dX;
      changedZone = 'zoneX';
    }
    if (dY) {
      rect.bottom += dY;
      rect.top += dY;
      changedZone = 'zoneY';
    }
    var position = getViewportPosition(rect, this.get('zoneRation'));

    this.get('component').send('zoneChange', position[changedZone], position);
    this.set('position', position);
  },

  resize: function() {
    this.getBoundaries();
  },

  getBoundaries: function() {
    var Rect = this.get('component.element').getBoundingClientRect();
    this.set('rect', {
      width: Rect.width,
      height: Rect.height,
      top: Rect.top,
      bottom: Rect.bottom,
      left: Rect.left,
      right: Rect.right
    });
    this.set('component._dimensions', this.get('rect'));
  },

  init: function() {
    let component = this.get('component');
    this.getBoundaries();
    this.set('key', guidFor(component));
    this.shift(0, 0);
    this._super();
  }

});


export default Ember.Service.extend({

  // call this to add your component to the notifier during `didInsertElement`
  register: function(component, opts) {
    TrackedComponents.addObject(
      TrackedItem.create({ component: component, opts: opts })
    );
  },

  // call this to remove your component during `willDestroyElement`
  unregister: function(component) {
    let TrackedItem = findComponent(guidFor(component));
    if (TrackedItem) {
      TrackedComponents.removeObject(TrackedItem);
    }
  },

  throttleResize: function() {
    run.throttle(this, resizeTrackedComponents, 16);
  },

  throttlePositionUpdate: function() {
    run.throttle(this, updateTrackedComponents, 16);
  },

  init: function() {

    ViewportDimensions.height = window.innerHeight;
    ViewportDimensions.width = window.innerWidth;

    ScrollPosition.x = document.body.scrollLeft;
    ScrollPosition.y = document.body.scrollTop;

    window.addEventListener('resize', () => {
      ViewportDimensions.height = window.innerHeight;
      ViewportDimensions.width = window.innerWidth;
      this.throttleResize();
    }, true);

    window.addEventListener('scroll', updateTrackedComponents, true);

    document.addEventListener('touchmove', updateTrackedComponents, true);

    this._super();
  }

});
