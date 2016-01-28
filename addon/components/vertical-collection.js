import Ember from 'ember';
import OcclusionMixin from '../mixins/occlusion-collection';
import layout from '../templates/components/vertical-collection';
import DebugMixin from '../debug/vertical-collection-debugging';

const {
  Component
} = Ember;

const VerticalCollection = Component.extend(OcclusionMixin, {
  /*
   * Defaults to `vertical-collection`.
   *
   * If itemTagName is blank or null, the `vertical-collection` will [tag match](../addon/utils/get-tag-descendant.js)
   * with the `vertical-item`.
   */
  tagName: 'vertical-collection',
  layout,

  // –––––––––––––– Required Settings

  /*
   * This height is used to give the `vertical-item`s height prior to
   * it's content being rendered.
   *
   * This height is replaced with the actual rendered height once content
   * is rendered for the first time.
   */
  defaultHeight: 75,
  alwaysUseDefaultHeight: false,

  /*
   * Cached value used once default height is
   * calculated firmly
   */
  _defaultHeight: null,

  // –––––––––––––– Optional Settings

  /*
   * Set this if you need to dynamically change the height of the container
   * (useful for viewport resizing on mobile apps when the keyboard is open).
   *
   * Changes to this property's value will trigger new viewport boundary
   * calculations.  This works for height or width changes, it's value is
   * never actually used.
   */
  containerSize: null,

  _spacerAboveStyle: Ember.computed('__smSpacerAboveHeight', function () {
    return this._spacerString(this.get('__smSpacerAboveHeight'));
  }),

  _spacerBelowStyle: Ember.computed('__smSpacerBelowHeight', function () {
    return this._spacerString(this.get('__smSpacerBelowHeight'));
  }),

  _spacerString(height) {
    return new Ember.Handlebars.SafeString(
      `width: 100%; height: ${height}px;`
    );
  }
});

Ember.runInDebug(() => {
  VerticalCollection.reopen(DebugMixin);
});

export default VerticalCollection;
