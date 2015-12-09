import Ember from 'ember';
import OcclusionMixin from '../mixins/horizontal-occlusion-collection';
import layout from '../templates/components/horizontal-collection';
import DebugMixin from '../debug/horizontal-collection-debugging';

const {
  Component
} = Ember;

const HorizontalCollection = Component.extend(OcclusionMixin, {
  /*
   * Defaults to `horizontal-collection`.
   *
   * If itemTagName is blank or null, the `horizontal-collection` will [tag match](../addon/utils/get-tag-descendant.js)
   * with the `horizontal-item`.
   */
  tagName: 'horizontal-collection',
  layout,

  // –––––––––––––– Required Settings

  /*
   * This width is used to give the `horizontal-item`s width prior to
   * it's content being rendered.
   *
   * This width is replaced with the actual rendered width once content
   * is rendered for the first time.
   */
  defaultWidth: 75,
  alwaysUseDefaultWidth: false,

  /*
   * Cached value used once default width is
   * calculated firmly
   */
  _defaultWidth: null,

  // –––––––––––––– Optional Settings

  /*
   * Set this if you need to dynamically change the width of the container
   * (useful for viewport resizing on mobile apps when the keyboard is open).
   *
   * Changes to this property's value will trigger new viewport boundary
   * calculations.  This works for width or width changes, it's value is
   * never actually used.
   */
  containerSize: null

});

Ember.runInDebug(() => {
  HorizontalCollection.reopen(DebugMixin);
});

export default HorizontalCollection;
