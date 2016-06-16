import Ember from 'ember';
import layout from './template';
import DebugMixin from 'smoke-and-mirrors/-debug/edge-visualization/debug-mixin';
import ListRadar from '../../-private/models/list-radar';

const {
  Component,
  computed
  } = Ember;

const Collection = Component.extend({
  layout,
  tagName: 'sm-collection',

  // available as a positionalParam
  items: null,

  actualizedItems: computed.alias('items'),

  containerSelector: 'body', // undefined,

  setupContainer() {
    const containerSelector = this.get('containerSelector');
    let container;

    if (containerSelector === 'body') {
      container = window;
    } else {
      container = this.element.parentNode;
    }

    this._container = container;
  },

  setupHandlers() {
    const container = this._container;
    const onScrollMethod = (dY, dX) => {
      
    };

    const onResizeMethod = () => {
      this.notifyPropertyChange('_edges');
    };

    this.radar.setState({
      telescope: this._container,
      resizeDebounce: this.resizeDebounce,
      sky: container === window ? document.body : this.element,
      minimumMovement: this.minimumMovement
    });
    this.radar.didResizeSatellites = onResizeMethod;
    this.radar.didUpdatePosition = onResizeMethod;
    this.radar.didShiftSatellites = onScrollMethod;
  },

  didInsertElement() {
    this.setupContainer();
    this.setupHandlers();
  },

  init() {
    this._super();
    this.radar = new ListRadar({});
  }

});

Collection.reopenClass({
  positionalParams: ['items']
});

Ember.runInDebug(() => {
  Collection.reopen(DebugMixin);
});

export default Collection;
