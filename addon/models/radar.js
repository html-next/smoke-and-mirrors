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
    this.posX = document.body.scrollLeft;
    this.posY = document.body.scrollTop;

    this.minimumMovement = state.minimumMovement || 15;
    this.resizeDebounce = state.resizeDebounce || 64;
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
  willAdjustPosition() {}
  didAdjustPosition() {}

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
    if (this.sky) {
      this.sky.setState();
    }
  }

  _shift(dY, dX) {
    // move the satellites
    this.satellites.forEach((c) => {
      c.shift(dY, dX);
    });

    // move the sky
    this.sky.left -= dX;
    this.sky.right -= dX;
    this.sky.bottom -= dY;
    this.sky.top -= dY;
  }

  shiftSatellites(dY, dX) {
    this.willShiftSatellites(dY, dX);
    this._shift(dY, dX);
    this.didShiftSatellites(dY, dX);
  }

  silentNight(dY, dX) {
    this.scrollY = this.scrollContainer.scrollTop += dY;
    this.scrollX = this.scrollContainer.scrollLeft += dX;
    this.rebuild();
  }

  rebuild() {
    this.updateSkyline();
    this.posX = document.body.scrollLeft;
    this.posY = document.body.scrollTop;
    this.satellites.forEach((satellite) => {
      satellite.geography.setState();
    });
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

  updateScrollPosition() {
    let _posX = this.posX;
    let _posY = this.posY;
    let posX = document.body.scrollLeft;
    let posY = document.body.scrollTop;
    if (this.isEarthquake(_posY, posY) || this.isEarthquake(_posX, posX)) {
      this.posY = posY;
      this.posX = posX;
      this.adjustPosition(posY - _posY, posX - _posX);
    }
  }

  _adjustPosition(dY, dX) {
    this.planet.top -= dY;
    this.planet.bottom -= dY;
    this.planet.left -= dX;
    this.planet.right -= dX;

    this._shift(dY, dX);
  }

  adjustPosition(dY,dX) {
    this.willAdjustPosition(dY, dX);
    this._adjustPosition(dY, dX);
    this.didAdjustPosition(dY, dX);
  }

  _setupHandlers() {
    this._resizeHandler = null;
    this._scrollHandler = null;
    this._nextResize = null;
    this._nextScroll = null;
    this._nextAdjustment = null;

    this._scrollHandler = () => {
      if (this.isTracking) {
        this._nextScroll = run.scheduleOnce('sync', this, this.filterMovement);
      }
    };
    this._resizeHandler = () => {
      this._nextResize = run.debounce(this, this.resizeSatellites, this.resizeDebounce);
    };
    this._scrollAdjuster = () => {
      this._nextAdjustment = run.scheduleOnce('sync', this, this.updateScrollPosition);
    };

    window.addEventListener('resize', this._resizeHandler, true);
    this.telescope.addEventListener('scroll', this._scrollHandler, true);
    if (this.scrollContainer !== document.body) {
      document.body.addEventListener('scroll', this._scrollAdjuster, true);
    }
  }

  _teardownHandlers() {
    run.cancel(this._nextResize);
    run.cancel(this._nextScroll);
    run.cancel(this._nextAdjustment);
    window.removeEventListener('resize', this._resizeHandler, true);
    if (this.telescope) {
      this.telescope.removeEventListener('scroll', this._scrollHandler, true);
    }
    if (this.scrollContainer !== document.body) {
      document.body.removeEventListener('scroll', this._scrollAdjuster, true);
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
