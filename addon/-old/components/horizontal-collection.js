import Ember from 'ember';
import OcclusionCollectionMixin from '../mixins/occlusion-collection';
import layout from '../templates/components/horizontal-collection';

const {
  Component
  } = Ember;

export default Component.extend(OcclusionCollectionMixin, {
  layout,

  defaultWidth: 200,
  _defaultWidth: null,
  alwaysUseDefaultWidth: false,

  /*
   * Defaults to `div`.
   *
   * If itemTagName is blank or null, the `horizontal-collection` will [tag match](../addon/utils/get-tag-descendant.js)
   * with the `horizontal-item`.
   */
  tagName: 'horizontal-collection',

  /*
   * Used if you want to explicitly set the tagName of `horizontal-item`s
   */
  itemTagName: ''

});
