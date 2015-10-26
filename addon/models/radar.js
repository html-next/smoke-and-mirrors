import Ember from 'ember';
import Satellite from './satellite';
import Geography from './geography';

const {
  guidFor,
  run
  } = Ember;


export default class Radar {

  constructor(state) {
    this.satellites = [];
    this.setState(state || {});
  }

  setState(state) {
    /*
     A scrollable consists of two parts, a telescope
     and a skyline.

     The telescope is the "constrained viewport", while
     the sky is the element with the full height of
     the content.
     */
    this.telescope = state.telescope;
    this.skyline = state.skyline;

    this.planet = this.telescope ? new Geography(this.telescope) : null;
    this.scrollContainer = this.telescope === window ? document.body : this.telescope;
    this.sky = this.skyline ? new Geography(this.skyline) : null;

    this.scrollX = this.scrollContainer ? this.scrollContainer.scrollLeft : 0;
    this.scrollY = this.scrollContainer ? this.scrollContainer.scrollTop : 0;
    this.minimumMovement = state.minimumMovement || 25;
    this.resizeDebounce = state.resizeDebounce || 64;
    this.scrollThrottle = state.scrollThrottle || 8;
    this.isTracking = state.hasOwnProperty('isTracking') ? state.isTracking : true;
    if (this.telescope && this.skyline) {
      this._teardownHandlers();
      this._setupHandlers();
    }
  }

  register(component) {
    this.satellites.push(new Satellite(component));
  }

  unregister(component) {
    let key = guidFor(component);
    if (!this.satellites) {
      return;
    }
    let satellite = this.satellites.find((satellite) => {
      return satellite.key === key;
    });
    if (satellite) {
      let index = this.satellites.indexOf(satellite);
      this.satellites.splice(index, 1);
      satellite.destroy();
    }
  }

  isEarthquake(a, b) {
    return (Math.abs(b - a) >= this.minimumMovement);
  }

  willShiftSatellites() {}
  didShiftSatellites() {}
  willResizeSatellites() {}
  didResizeSatellites() {}

  _resize() {
    this.satellites.forEach((c) => {
      c.resize();
    });
  }

  resizeSatellites() {
    this.willResizeSatellites();
    this._resize();
    this.didResizeSatellites();
  }

  updateSkyline() {
    this.sky.setState();
  }

  _shift(dY, dX) {
    // move the satellites
    this.satellites.forEach((c) => {
      c.shift(dY, dX);
    });

    // move the sky
    if (dX) {
      this.sky.left -= dX;
      this.sky.right -= dX;
    }
    if (dY) {
      this.sky.bottom -= dY;
      this.sky.top -= dY;
    }
  }

  shiftSatellites(dY, dX) {
    this.willShiftSatellites(dY, dX);
    this._shift(dY, dX);
    this.didShiftSatellites(dY, dX);
  }

  filterMovement() {
    // cache the scroll offset, and discard the cycle if
    // movement is within (x) threshold
    let scrollY = this.scrollContainer.scrollTop;
    let scrollX = this.scrollContainer.scrollLeft;
    let _scrollY = this.scrollY;
    let _scrollX = this.scrollX;
    if (this.isEarthquake(_scrollY, scrollY) || this.isEarthquake(_scrollX, scrollX)) {
      this.scrollY = scrollY;
      this.scrollX = scrollX;
      this.shiftSatellites(scrollY - _scrollY, scrollX - _scrollX);
    }
  }

  _setupHandlers() {
    this._resizeHandler = null;
    this._scrollHandler = null;
    this._nextResize = null;
    this._nextScroll = null;

    this._scrollHandler = () => {
      if (this.isTracking) {
        this._nextScroll = run.throttle(this, this.filterMovement, this.scrollThrottle);
      }
    };
    this._resizeHandler = () => {
      this._nextResize = run.debounce(this, this.resizeSatellites, this.resizeDebounce);
    };

    window.addEventListener('resize', this._resizeHandler, true);
    this.telescope.addEventListener('scroll', this._scrollHandler, true);
  }

  _teardownHandlers() {
    run.cancel(this._nextResize);
    run.cancel(this._nextScroll);
    window.removeEventListener('resize', this._resizeHandler, true);
    if (this.telescope) {
      this.telescope.removeEventListener('scroll', this._scrollHandler, true);
    }
  }

  destroy() {
    this._teardownHandlers();
    this.satellites.forEach((satellite) => {
      satellite.destroy();
    });
    this.satellites = null;
  }

}
