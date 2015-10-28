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
    this._super(source);
    this.visualize();
  },

  setupHandlers() {
    this._super();
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
    this._super(toCull, toHide);
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
    this._super(addCount);
    this.visualize();
  },

  willDestroy() {
    this._super();
    run.cancel(this._nextVisualization);
    this.visualization.destroy();
  }

});

