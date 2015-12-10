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

    if (this.vertical) {
      return {
        viewportStart: rect.top,
        visibleStart: (-1 * bufferSize * rect.height) + rect.top,
        invisibleStart: (-2 * bufferSize * rect.height) + rect.top,
        viewportEnd: rect.bottom,
        visibleEnd: (bufferSize * rect.height) + rect.bottom,
        invisibleEnd: (2 * bufferSize * rect.height) + rect.bottom
      };
    } else {
      return {
        viewportStart: rect.left,
        visibleStart: (-1 * bufferSize * rect.width) + rect.left,
        invisibleStart: (-2 * bufferSize * rect.width) + rect.left,
        viewportEnd: rect.right,
        visibleEnd: (bufferSize * rect.width) + rect.right,
        invisibleEnd: (2 * bufferSize * rect.width) + rect.right
      };
    }
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
