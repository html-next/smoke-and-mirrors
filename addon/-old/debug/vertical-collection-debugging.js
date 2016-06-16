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

  toggleEdgeVisualization() {
    this.toggleProperty('showEdges');
  },

  __smScheduleUpdate(source) {
    this._super(source);
    this.visualize();
  },

  visualization: null,
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

    const bufferSize = Number(this.get('bufferSize'));
    const rect = this.radar.planet;

    this.visualize();

    return {
      viewportTop: rect.top,
      visibleTop: (-1 * bufferSize * rect.height) + rect.top,
      viewportBottom: rect.bottom,
      visibleBottom: (bufferSize * rect.height) + rect.bottom
    };
  }),

  _removeComponents(toCull, toHide) {
    this._super(toCull, toHide);
    this.visualize();
  },

  visualize() {
    if (!this.get('showEdges')) {
      if (this.visualization) {
        this.visualization.destroy();
        this.visualization = null;
      }
      return;
    }
    this._nextVisualization = run.scheduleOnce('afterRender', () => {
      if (this.visualization) {
        this.visualization.render();
      }
    });
  },

  __prependComponents(addCount) {
    this._super(addCount);
    this.visualize();
  },

  willDestroy() {
    this._super();
    run.cancel(this._nextVisualization);
    if (this.visualization) {
      this.visualization.destroy();
      this.visualization = null;
    }
  }

});

