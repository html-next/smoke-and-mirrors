import Ember from 'ember';
import OcclusionMixin from '../mixins/occlusion-collection';
import layout from '../templates/components/vertical-collection';

const {
  Component
} = Ember;

var VerticalCollection = Component.extend(OcclusionMixin, {


  layout: layout,

  //–––––––––––––– Required Settings

  /**!
   * This height is used to give the `OcclusionItem`s height prior to their content being rendered.
   * This height is replaced with the actual rendered height once content is rendered for the first time.
   *
   * If your content will always have the height specified by `defaultHeight`, you can improve performance
   * by specifying `alwaysUseDefaultHeight: true`.
   */
  defaultHeight: "75px",

  /**!
   * Cached value used once default height is
   * calculated firmly
   */
  _defaultHeight: null,


  //–––––––––––––– Optional Settings

  /**!
   * Set this if you need to dynamically change the height of the container
   * (useful for viewport resizing on mobile apps when the keyboard is open).
   *
   * Changes to this property's value are observed and trigger new view boundary
   * calculations.
   */
  // TODO how to deal with this horizontally vs vertically
  containerHeight: null,

  /**!
   * Defaults to `div`.
   *
   * If itemTagName is blank or null, the `vertical-collection` will [tag match](../addon/utils/get-tag-descendant.js)
   * with the `vertical-item`.
   */
  tagName: 'vertical-collection',


  //–––––––––––––– Performance Tuning

  /**!
   * If true, dynamic height calculations are skipped and
   * `defaultHeight` is always used as the height of each
   * `OccludedView`.
   */
  // TODO alwaysUseDefaultWidth
  alwaysUseDefaultHeight: false

});

Ember.runInDebug(() => {
  const {
    observer,
    run
  } = Ember;

  const appendDivs = () => {
    const appendDebugDiv = cssClass => {
      return $(`<div class="${cssClass}"></div>`).appendTo('.zoomed-edge-visualization');
    };

    $zoomContainer = $('<div class="zoomed-edge-visualization"></div>').appendTo('body');
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

  const removeDivs = (edges) => {
    $zoomContainer.remove();

    $zoomContainer = null;
    $highlightViewport = null;
    $highlightVisible = null;
    $highlightInvisible = null;
  };

  let $zoomContainer;
  let $highlightViewport;
  let $highlightVisible;
  let $highlightInvisible;
  let divsAreInDOM = false;

  VerticalCollection.reopen({
    showEdges: false,

    toggleEdgeVisualization () {
      this.toggleProperty('showEdges');
    },

    __edgeVisualizationObserver: observer('showEdges', '_edges', function () {
      run.scheduleOnce('render', this, '__updateEdgeVisualization');
    }),

    __updateEdgeVisualization () {
      if (this.get('showEdges')) {
        let edges = this.get('_edges');
        let width = this._$container.width();

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
});

export default VerticalCollection;
