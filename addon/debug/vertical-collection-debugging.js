import Ember from 'ember';
import Visualization from './visualization';

const {
  run,
  Mixin
  } = Ember;


export default Mixin.create({
  showEdges: true,
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
    this._nextVisualization = run.scheduleOnce(
      'render',
      () => {
        this.visualization.render();
      });
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
    this.visualization = new Visualization(this);
  },

  willDestroy() {
    this._super();
    run.cancel(this._nextVisualization);
    this.visualization.destroy();
  }

});

