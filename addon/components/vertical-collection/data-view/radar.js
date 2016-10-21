import Geography from 'smoke-and-mirrors/-private/radar/models/geography';
import Container from 'smoke-and-mirrors/-private/radar/models/container';
import SUPPORTS_PASSIVE from 'smoke-and-mirrors/-private/radar/utils/supports-passive';
import Token from 'smoke-and-mirrors/-private/scheduler/token';
import {
  addScrollHandler,
  removeScrollHandler
} from 'smoke-and-mirrors/-private/radar/utils/scroll-handler';
import scheduler from 'smoke-and-mirrors/-private/scheduler';

function K() {}

export default class Radar {
  constructor(o) {
    this.token = new Token(o.token);
    this.options = o;
    this.edges = {
      visibleTop: 0,
      visibleBottom: 0,
      bufferedTop: 0,
      bufferedBottom: 0
    };

    /*
     A scrollable consists of two parts, a telescope
     and a skyline.

     The telescope is the "constrained viewport", while
     the sky is the element with the full height of
     the content.
     */
    this.telescope = (o.telescope === window || o.telescope === document.body) ? Container : o.telescope;
    this.sky = o.sky;
    this._scrollIsForward = 0;

    this.planet = new Geography(this.telescope);
    this.skyline = new Geography(this.sky);

    this.scrollX = this.telescope.scrollLeft;
    this.scrollY = this.telescope.scrollTop;
    this.posX = Container.scrollLeft;
    this.posY = Container.scrollTop;
    this.isTracking = true;

    this._setupHandlers();
    this.updateEdges();
  }

  schedule(queueName, job) {
    scheduler.schedule(queueName, job, this.token);
  }

  rebuild() {
    this.schedule('measure', () => {
      this.planet.setState();
      this.skyline.setState();

      this.scrollX = this.telescope.scrollLeft;
      this.scrollY = this.telescope.scrollTop;
      this.posX = Container.scrollLeft;
      this.posY = Container.scrollTop;
    });
  }

  _setupHandlers() {
    this._nextResize = null;
    this._nextScroll = null;
    this._nextAdjustment = null;
    this.currentOffsets = null;
    this.currentAdjustOffsets = null;
    this.didScrollInner = K;

    this._scrollHandler = (offsets) => {
      if (this.isTracking) {
        this.currentOffsets = offsets;

        if (this._nextScroll === null) {
          this._nextScroll = this.schedule('sync', () => {
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
        this._nextResize = this.schedule('sync', () => {
          this.updateEdges();
          this._nextResize = null;
        });
      }
    };

    this._scrollAdjuster = (offsets) => {
      this.currentAdjustOffsets = offsets;
      if (this._nextAdjustment === null) {
        this._nextAdjustment = this.schedule('sync', () => {
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

      // move the sky
      this.skyline.left -= dX;
      this.skyline.right -= dX;
      this.skyline.bottom -= dY;
      this.skyline.top -= dY;

      this._scrollIsForward = dY > 0;

      this.didScroll(dY, dX);
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

      this.currentAdjustOffsets = null;
    }
  }

  adjustPosition(dY, dX) {
    this.planet.top -= dY;
    this.planet.bottom -= dY;
    this.planet.left -= dX;
    this.planet.right -= dX;

    this.skyline.top -= dY;
    this.skyline.bottom -= dY;
    this.skyline.left -= dX;
    this.skyline.right -= dX;

    this.updateEdges(dY, dX);
  }

  isEarthquake(a, b) {
    return (Math.abs(b - a) >= this.options.minimumMovement);
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

    this.token.cancelled = true;
    this._scrollHandler = K;
    this._resizeHandler = K;
    this._scrollAdjuster = K;
    this.didScrollInner = K;
  }

  /*
   * Calculates pixel boundaries between visible, invisible,
   * and culled items based on the "viewport" height,
   * and the bufferSize.
   *
   * @private
   */
  updateEdges() {
    if (!this.planet) {
      return;
    }

    const { planet: rect, edges } = this;
    const { bufferSize } = this.options;

    edges.visibleTop = rect.top;
    edges.visibleBottom = rect.bottom;
    edges.bufferedTop = (-1 * bufferSize * rect.height) + rect.top;
    edges.bufferedBottom = (bufferSize * rect.height) + rect.bottom;
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
    this.token = undefined;

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
