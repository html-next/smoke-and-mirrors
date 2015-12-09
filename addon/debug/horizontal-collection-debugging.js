import Ember from 'ember';
import Visualization from './hor-visualization';

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
      viewportLeft: rect.left,
      visibleLeft: (-1 * bufferSize * rect.width) + rect.left,
      invisibleLeft: (-2 * bufferSize * rect.width) + rect.left,
      viewportRight: rect.right,
      visibleRight: (bufferSize * rect.width) + rect.right,
      invisibleRight: (2 * bufferSize * rect.width) + rect.right
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
