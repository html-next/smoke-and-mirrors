import Ember from 'ember';
import Visualization from './visualization';

const {
  computed,
  Mixin
  } = Ember;

export default Mixin.create({
  debug: false,
  showEdges: computed.alias('debug'),

  _nextVisualization: null,

  toggleEdgeVisualization() {
    this.toggleProperty('debug');
  },

  visualization: null,
  didInsertElement() {
    this._super();
    if (this.get('debug')) {
      this.visualization = new Visualization(this);
      requestAnimationFrame(() => {
        this.visualize();
      });
    }
  },

  visualize() {
    if (!this.get('debug')) {
      if (this.visualization) {
        this.visualization.destroy();
        this.visualization = null;
      }
      return;
    }

    if (this.visualization) {
      this.visualization.render();
      requestAnimationFrame(() => {
        this.visualize();
      });
    }
  },

  willDestroy() {
    this._super();
    if (this.visualization) {
      this.visualization.destroy();
      this.visualization = null;
    }
  }
});

