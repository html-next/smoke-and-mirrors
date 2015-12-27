import Ember from 'ember';
import OcclusionMixin from '../mixins/occlusion-collection';
import layout from '../templates/components/sm-collection';
import DebugMixin from '../debug/collection-debugging';

const {
  Component
  } = Ember;

const Collection = Component.extend(OcclusionMixin, {
  /*
   * Defaults to `sm-collection`.
   *
   * If itemTagName is blank or null, the `sm-collection` will [tag match](../addon/utils/get-tag-descendant.js)
   * with the `collection-item`.
   */
  tagName: 'sm-collection',
  layout,
  vertical: true,
  classNames: null,

  // –––––––––––––– Required Settings

  /*
   * This dimension is used to give the `collection-item`s dimensions prior to
   * it's content being rendered.
   *
   * This dimension is replaced with the actual rendered dimension once content
   * is rendered for the first time.
   */
  defaultDim: 75,
  alwaysUseDefaultDim: false,

  /*
   * Cached value used once default width is
   * calculated firmly
   */
  _defaultDim: null,

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
  Collection.reopen(DebugMixin);
});

export default Collection;
