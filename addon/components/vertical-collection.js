import Ember from 'ember';
import OcclusionCollectionMixin from '../mixins/occlusion-collection';
import layout from '../templates/components/vertical-collection';

const {
  Component
} = Ember;

export default Component.extend(OcclusionCollectionMixin, {


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
