import Ember from 'ember';
import Satellite from './satellite';
import Geography from './geography';
import TweenLite from 'tweenlite';
import Container from './container';
import SUPPORTS_PASSIVE from '../utils/supports-passive';
import {
  addScrollHandler,
  removeScrollHandler
} from '../utils/scroll-handler';

const {
  guidFor,
  run
  } = Ember;

const DEFAULT_ARRAY_SIZE = 200;

export default class Radar {

  constructor(state) {
    this.satellites = new Array(DEFAULT_ARRAY_SIZE);
    this.length = 0;
    this.maxLength = DEFAULT_ARRAY_SIZE;
    this.tween = undefined ;
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
    this.resizeDebounce = state.resizeDebounce || 64;
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

  killTween() {
    if (this.tween) {
      this.tween.kill();
      this.tween = undefined;
    }
  }

  scrollToX(offset, jumpTo) {
    if (!this.telescope) {
      return false;
    }
    this.killTween();
    if (jumpTo) {
      this.setScrollState(undefined, offset);
    } else {
      const tweenData = {
        scrollLeft: this.scrollX || 0
      };
      const radar = this;
      this.tween = TweenLite.to(
        tweenData,
        0.35,
        {
          scrollLeft: offset,
          onUpdate() {
            radar.setScrollState(undefined, tweenData.scrollLeft, true);
          }
        });
    }
  }

  scrollToY(offset, jumpTo) {
    if (!this.telescope) {
      return false;
    }
    this.killTween();
    if (jumpTo) {
      this.setScrollState(offset);
    } else {
      const tweenData = {
        scrollTop: this.scrollY || 0
      };
      const radar = this;
      this.tween = TweenLite.to(
        tweenData,
        0.35,
        {
          scrollTop: offset,
          onUpdate() {
            radar.setScrollState(tweenData.scrollTop, undefined, true);
          }
        });
    }
  }

  setScrollState(y, x, check) {
    if (y || y === 0) {
      if (check && Math.abs(this.scrollY - y) > 3) {
        this.killTween();
        return;
      }
      this.scrollY = this.telescope.scrollTop = Math.round(y);
    }
    if (x || x === 0) {
      if (check && Math.abs(this.scrollY - x) > 3) {
        this.killTween();
        return;
      }
      this.scrollX = this.telescope.scrollLeft = Math.round(x);
    }
  }

  scrollToPosition(offsetY, offsetX, jumpTo) {
    if (!this.telescope) {
      return false;
    }
    this.killTween();
    if (jumpTo) {
      this.setScrollState(offsetY, offsetX);
    } else {
      const tweenData = {
        scrollTop: this.scrollY || 0,
        scrollLeft: this.scrollX || 0
      };
      const radar = this;
      this.tween = TweenLite.to(
        tweenData,
        0.35,
        {
          scrollTop: offsetY,
          scrollLeft: offsetX,
          onUpdate() {
            radar.setScrollState(tweenData.scrollTop, tweenData.scrollLeft, true);
          }
        });
    }
  }

  register(component) {
    let satellite = new Satellite({
      element: component.element,
      radar: this,
      id: guidFor(component)
    });

    this._push(satellite);
    return satellite;
  }

  unregister(component) {
    const key = guidFor(component);

    if (!this.satellites) {
      return;
    }

    const satellite = this.satellites.find((sat) => {
      return sat.key === key;
    });

    if (satellite) {
      const index = this.satellites.indexOf(satellite);

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
      this.filterMovement();
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
    this.rebuild();
  }

  rebuild() {
    this.posX = Container.scrollLeft;
    this.posY = Container.scrollTop;

    for (let i = 0; i < this.length; i++) {
      this.satellites[i].geography.setState();
    }
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

      this.shiftSatellites(dY, dX);
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
    }
  }

  _adjustPosition(dY, dX) {
    this.planet.top -= dY;
    this.planet.bottom -= dY;
    this.planet.left -= dX;
    this.planet.right -= dX;

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
    this._nextResize = undefined;
    this._nextScroll = undefined;
    this._nextAdjustment = undefined;

    this._scrollHandler = (offsets) => {
      if (this.isTracking) {
        this._nextScroll = run.scheduleOnce('sync', this, this.filterMovement, offsets);
      }
    };
    this._resizeHandler = () => {
      this._nextResize = run.debounce(this, this.resizeSatellites, this.resizeDebounce);
    };
    this._scrollAdjuster = (offsets) => {
      this._nextAdjustment = run.scheduleOnce('sync', this, this.updateScrollPosition, offsets);
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
      removeScrollHandler(this.telescope, this._scrollAdjuster);
    }
    if (this.telescope !== Container) {
      removeScrollHandler(Container, this._scrollAdjuster);
    }
    run.cancel(this._nextResize);
    run.cancel(this._nextScroll);
    run.cancel(this._nextAdjustment);
    this._scrollHandler = undefined ;
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
    if(this.satellites) {
      for (let i = 0; i < this.length; i++) {
        this.satellites[i].destroy();
      }
    }
    this.satellites = undefined;
    this.telescope = undefined;
    this.sky = undefined;

    if(this.planet) {
      this.planet.destroy();
    }
    this.planet = undefined;
    if(this.skyline) {
      this.skyline.destroy();
    }
    this.skyline = undefined;
  }

}
