import Ember from 'ember';
import jQuery from 'jquery';

const {
  observer,
  run,
  Mixin
  } = Ember;

var $zoomContainer;
var $highlightViewport;
var $highlightVisible;
var $highlightInvisible;
var divsAreInDOM = false;

const appendDivs = () => {
  const appendDebugDiv = cssClass => {
    return jQuery(`<div class="${cssClass}"></div>`).appendTo('.zoomed-edge-visualization');
  };

  $zoomContainer = jQuery('<div class="zoomed-edge-visualization"></div>').appendTo('body');
  $highlightViewport = appendDebugDiv('highlight-viewport');
  $highlightVisible = appendDebugDiv('highlight-visible');
  $highlightInvisible = appendDebugDiv('highlight-invisible');
};

const updateEdgeVisuals = (edges, width) => {
  const updateDebugDiv = ($e, posArgs) => {
    posArgs.height = (posArgs.bottom - posArgs.top) + 'px';
    posArgs.top += 'px';
    posArgs.width = width;
    $e.css(posArgs);
  };

  updateDebugDiv($highlightViewport, { top: edges.viewportTop, bottom: edges.viewportBottom });
  updateDebugDiv($highlightVisible, { top: edges.visibleTop, bottom: edges.visibleBottom });
  updateDebugDiv($highlightInvisible, { top: edges.invisibleTop, bottom: edges.invisibleBottom });
};

const removeDivs = (/*edges*/) => {
  $zoomContainer.remove();

  $zoomContainer = null;
  $highlightViewport = null;
  $highlightVisible = null;
  $highlightInvisible = null;
};

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
    this._nextVisualization = run.scheduleOnce('render', this, this.__updateEdgeVisualization);
  },

  willDestroy() {
    this._super();
    run.cancel(this._nextVisualization);
    removeDivs();
    divsAreInDOM = false;
  },

  __edgeVisualizationObserver: observer('showEdges', '_edges', function () {
    run.scheduleOnce('render', this, '__updateEdgeVisualization');
  }),

  __updateEdgeVisualization () {
    if (this.get('showEdges')) {
      let edges = this.get('_edges');
      let width = jQuery(this._container).width();

      if (divsAreInDOM) {
        updateEdgeVisuals(edges, width);
      } else {
        appendDivs();
        updateEdgeVisuals(edges, width);
        divsAreInDOM = true;
      }
    } else if (divsAreInDOM) {
      removeDivs();
      divsAreInDOM = false;
    }
  }
});

