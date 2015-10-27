import Ember from 'ember';
import Visualization from './visualization';

const {
  run,
  computed,
  Mixin
  } = Ember;


export default Mixin.create({
  showEdges: false,
  _nextVisualization: null,

  toggleEdgeVisualization () {
    this.toggleProperty('showEdges');
  },

  /**
   * Overrider to implement edge updates
   */
  _sm_scheduleUpdate(source) {
    if (this._isPrepending) {
      return;
    }
    this._nextUpdate = run.scheduleOnce('actions', this, this._updateChildStates, source);
    this.visualize();
  },

  setupHandlers() {
    let resizeDebounce = this.resizeDebounce;
    let scrollThrottle = this.scrollThrottle;
    let container = this._container;
    let onScrollMethod = (dY, dX) => {
      this._scheduleOcclusion(dY, dX);
    };

    let onResizeMethod = () => {
      this.notifyPropertyChange('_edges');
    };

    this.radar.setState({
      telescope: this._container,
      resizeDebounce: resizeDebounce,
      skyline: container === window ? document.body : this.element,
      minimumMovement: this.minimumMovement,
      scrollThrottle: scrollThrottle
    });
    this.radar.didResizeSatellites = onResizeMethod;
    this.radar.didShiftSatellites = onScrollMethod;

    if (this.get('showEdges')) {
      this.visualization = new Visualization(this);
    }
  },

  _edges: computed('containerSize', function() {
    if (!this.radar || !this.radar.planet) {
      return {};
    }

    // segment top break points
    this.radar.planet.setState();

    let bufferSize = this.get('bufferSize');
    let rect = this.radar.planet;

    this.visualize();

    return {
      viewportTop: rect.top,
      visibleTop: (-1 * bufferSize * rect.height) + rect.top,
      invisibleTop: (-2 * bufferSize * rect.height) + rect.top,
      viewportBottom: rect.bottom,
      visibleBottom: (1 * bufferSize * rect.height) + rect.bottom,
      invisibleBottom: (2 * bufferSize * rect.height) + rect.bottom
    };
  }),

  _removeComponents(toCull, toHide) {
    toCull.forEach((v) => { v.cull(); });
    toHide.forEach((v) => { v.hide(); });
    this.visualize();
  },

  visualize() {
    if (!this.get('showEdges')) {
      return;
    }
    this._nextVisualization = run.scheduleOnce(
      'afterRender',
      () => {
        this.visualization.render();
      });
  },

  __prependComponents(addCount) {
    if (this.get('_sm_canRender')) {
      this._isPrepending = true;
      run.cancel(this._nextUpdate);
      this._nextUpdate = run.scheduleOnce('actions', this, function() {
        let heightPerItem = this.__getEstimatedDefaultHeight();
        this.radar.silentNight(addCount * heightPerItem, 0);
        this._updateChildStates('prepend');
        this.visualize();
        this._isPrepending = false;
      });
    }
  },

  willDestroy() {
    this._super();
    run.cancel(this._nextVisualization);
    this.visualization.destroy();
  }

});

