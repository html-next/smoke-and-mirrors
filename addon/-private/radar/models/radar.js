import Ember from 'ember';
import Satellite from './satellite';
import Geography from './geography';
import Container from './container';
import SUPPORTS_PASSIVE from '../utils/supports-passive';
import {
  addScrollHandler,
  removeScrollHandler
} from '../utils/scroll-handler';
import scheduler from '../../scheduler';

const {
  guidFor
  } = Ember;

const DEFAULT_ARRAY_SIZE = 200;

export default class Radar {
  constructor(state) {
    this.satellites = new Array(DEFAULT_ARRAY_SIZE);
    this.length = 0;
    this.alwaysRemeasure = false;
    this.maxLength = DEFAULT_ARRAY_SIZE;
    this.setState(state || {});
  }

  _push(satellite) {
    let index = this.length++;

    if (index === this.maxLength) {
      this.maxLength *= 2;
      this.satellites.length = this.maxLength;
    }

    this.satellites[index] = satellite;
  }

  setState(state) {
    /*
     A scrollable consists of two parts, a telescope
     and a skyline.

     The telescope is the "constrained viewport", while
     the sky is the element with the full height of
     the content.
     */
    if (this.telescope && state.telescope) {
      this._teardownHandlers();
    }
    this.telescope = state.telescope;
    this.sky = state.sky;

    if (this.telescope === window || this.telescope === document.body) {
      this.telescope = Container;
    }

    this.planet = this.telescope ? new Geography(this.telescope) : undefined;
    this.skyline = this.sky ? new Geography(this.sky) : undefined;

    this.scrollX = this.telescope ? this.telescope.scrollLeft : 0;
    this.scrollY = this.telescope ? this.telescope.scrollTop : 0;
    this.posX = Container.scrollLeft;
    this.posY = Container.scrollTop;

    this.minimumMovement = state.minimumMovement || 15;
    this.alwaysRemeasure = state.alwaysRemeasure || false;
    this.isTracking = state.hasOwnProperty('isTracking') ? state.isTracking : true;
    if (this.telescope && this.sky) {
      this._setupHandlers();
    }
  }

  getSatelliteZones(satellite) {
    return {
      y: this.getSatelliteYZone(satellite),
      x: this.getSatelliteXZone(satellite)
    };
  }

  getSatelliteYZone(satellite) {
    const satGeo = satellite.geography;
    let distance = 0;
    const yScalar = this.planet.height;

    if (satGeo.bottom > this.planet.top) {
      distance = satGeo.bottom - this.planet.top;

      return Math.floor(distance / yScalar);
    } else if (satGeo.top < this.planet.bottom) {
      distance = satGeo.top - this.planet.bottom;

      return Math.ceil(distance / yScalar);
    }

    return 0;
  }

  getSatelliteXZone(satellite) {
    const satGeo = satellite.geography;
    let distance = 0;
    const xScalar = this.planet.width;

    if (satGeo.right > this.planet.left) {
      distance = satGeo.right - this.planet.left;

      return Math.floor(distance / xScalar);
    } else if (satGeo.left < this.planet.right) {
      distance = satGeo.left - this.planet.right;

      return Math.ceil(distance / xScalar);
    }

    return 0;
  }

  register(component) {
    let sat = Satellite.create({
      component,
      dimensions: undefined,
      element: component.element,
      key: guidFor(component),
      radar: this,
      scalar: undefined
    });

    this._push(sat);

    return sat;
  }

  unregister(component) {
    const key = guidFor(component);

    if (!this.satellites) {
      return;
    }

    for (let i = 0; i < this.length; i++) {
      if (this.satellites[i].key === key) {
        const satellite = this.satellites[i];

        this.satellites.splice(i, 1);
        this.length--;
        this.maxLength--;
        satellite.destroy();
        break;
      }
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
  didRebuild() {}

  _resize() {
    for (let i = 0; i < this.length; i++) {
      this.satellites[i].resize();
    }
  }

  resizeSatellites() {
    this.willResizeSatellites();
    this._resize();
    this.didResizeSatellites();
  }

  updateSkyline() {
    if (this.skyline) {
      this.filterMovement({
        top: this.telescope.scrollTop,
        left: this.telescope.scrollLeft
      });
      this.skyline.setState();
    }
  }

  _shift(dY, dX) {
    // move the satellites
    for (let i = 0; i < this.length; i++) {
      this.satellites[i].shift(dY, dX);
    }

    // move the sky
    this.skyline.left -= dX;
    this.skyline.right -= dX;
    this.skyline.bottom -= dY;
    this.skyline.top -= dY;
  }

  shiftSatellites(dY, dX) {
    this.willShiftSatellites(dY, dX);
    this._shift(dY, dX);
    this.didShiftSatellites(dY, dX);
  }

  silentNight() {
    // Keeps skyline stationary when adding elements
    const _height = this.skyline.height;
    const _width = this.skyline.width;

    this.updateSkyline();

    const {
      height,
      width
    } = this.skyline;
    const dY = height - _height;
    const dX = width - _width;

    this.scrollY = this.telescope.scrollTop += dY;
    this.scrollX = this.telescope.scrollLeft += dX;
    this.skyline.left -= dX;
    this.skyline.right -= dX;
    this.skyline.bottom -= dY;
    this.skyline.top -= dY;

    this.posX = Container.scrollLeft;
    this.posY = Container.scrollTop;

    for (let i = 0; i < this.length; i++) {
      this.satellites[i].geography.setState();
    }
  }

  rebuild(dY, dX) {
    this.scrollY = this.telescope.scrollTop;
    this.scrollX = this.telescope.scrollLeft;
    this.posX = Container.scrollLeft;
    this.posY = Container.scrollTop;

    this.skyline.setState();
    this.planet.setState();

    for (let i = 0; i < this.length; i++) {
      this.satellites[i].geography.setState();
    }

    this.didRebuild(dY, dX);
  }

  filterMovement(offsets) {
    // cache the scroll offset, and discard the cycle if
    // movement is within (x) threshold
    const scrollY = offsets.top;
    const scrollX = offsets.left;
    const _scrollY = this.scrollY;
    const _scrollX = this.scrollX;

    if (this.isEarthquake(_scrollY, scrollY) || this.isEarthquake(_scrollX, scrollX)) {
      this.scrollY = scrollY;
      this.scrollX = scrollX;

      const dY = scrollY - _scrollY;
      const dX = scrollX - _scrollX;

      if (this.alwaysRemeasure) {
        this.rebuild(dY, dX);
        return;
      }

      this.shiftSatellites(dY, dX);
      this.currentOffsets = null;
    }
  }

  updateScrollPosition(offsets) {
    const _posX = this.posX;
    const _posY = this.posY;
    const posX = offsets.left;
    const posY = offsets.top;

    if (this.isEarthquake(_posY, posY) || this.isEarthquake(_posX, posX)) {
      this.posY = posY;
      this.posX = posX;
      this.adjustPosition(posY - _posY, posX - _posX);

      if (this.alwaysRemeasure) {
        this.rebuild(posY - _posY, posX - _posX);
        return;
      }

      this.currentAdjustOffsets = null;
    }
  }

  _adjustPosition(dY, dX) {
    this.planet.top -= dY;
    this.planet.bottom -= dY;
    this.planet.left -= dX;
    this.planet.right -= dX;

    this.skyline.top -= dY;
    this.skyline.bottom -= dY;
    this.skyline.left -= dX;
    this.skyline.right -= dX;

    this._shift(dY, dX);
  }

  adjustPosition(dY, dX) {
    this.willAdjustPosition(dY, dX);
    this._adjustPosition(dY, dX);
    this.didAdjustPosition(dY, dX);
  }

  _setupHandlers() {
    this._resizeHandler = undefined;
    this._scrollHandler = undefined;
    this._nextResize = null;
    this._nextScroll = null;
    this._nextAdjustment = null;
    this.currentOffsets = null;
    this.currentAdjustOffsets = null;

    this._scrollHandler = (offsets) => {
      if (this.isTracking) {
        this.currentOffsets = offsets;

        if (this._nextScroll === null) {
          scheduler.schedule('sync', () => {
            if (this.currentOffsets) {
              this.filterMovement(this.currentOffsets);
            }
            this._nextScroll = null;
          });
        }
      }
    };

    this._resizeHandler = () => {
      if (this._nextResize === null) {
        this._nextResize = scheduler.schedule('sync', () => {
          this.resizeSatellites();
          this._nextResize = null;
        });
      }
    };
    this._scrollAdjuster = (offsets) => {
      this.currentAdjustOffsets = offsets;
      if (this._nextAdjustment === null) {
        this._nextAdjustment = scheduler.schedule('sync', () => {
          if (this.currentAdjustOffsets) {
            this.updateScrollPosition(this.currentAdjustOffsets);
          }
          this._nextAdjustment = null;
        });
      }
    };

    let handlerOpts = SUPPORTS_PASSIVE ? { capture: true, passive: true } : true;

    Container.addEventListener('resize', this._resizeHandler, handlerOpts);
    addScrollHandler(this.telescope, this._scrollHandler);
    if (this.telescope !== Container) {
      addScrollHandler(Container, this._scrollAdjuster);
    }
  }

  _teardownHandlers() {
    let handlerOpts = SUPPORTS_PASSIVE ? { capture: true, passive: true } : true;

    Container.removeEventListener('resize', this._resizeHandler, handlerOpts);
    if (this.telescope) {
      removeScrollHandler(this.telescope, this._scrollHandler);
    }
    if (this.telescope !== Container) {
      removeScrollHandler(Container, this._scrollAdjuster);
    }
    scheduler.forget(this._nextResize);
    scheduler.forget(this._nextScroll);
    scheduler.forget(this._nextAdjustment);
    this._scrollHandler = undefined;
    this._resizeHandler = undefined;
    this._scrollAdjuster = undefined;
  }

  // avoid retaining memory by deleting references
  // that likely contain other scopes to be torn down
  _teardownHooks() {
    this.willShiftSatellites = undefined;
    this.didShiftSatellites = undefined;
    this.willResizeSatellites = undefined;
    this.didResizeSatellites = undefined;
    this.willAdjustPosition = undefined;
    this.didAdjustPosition = undefined;
  }

  destroy() {
    this._teardownHandlers();
    this._teardownHooks();
    if (this.satellites) {
      for (let i = 0; i < this.length; i++) {
        this.satellites[i].destroy();
      }
    }
    this.satellites = undefined;
    this.telescope = undefined;
    this.sky = undefined;

    if (this.planet) {
      this.planet.destroy();
    }

    this.planet = undefined;

    if (this.skyline) {
      this.skyline.destroy();
    }

    this.skyline = undefined;
  }
}
