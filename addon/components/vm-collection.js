import Ember from 'ember';
import MagicArrayMixin from '../mixins/magic-array';
import OcclusionCollectionMixin from '../mixins/occlusion-collection';
import nextFrame from '../utils/next-frame';
import jQuery from 'jquery';

const {
  get: get,
  Component,
  assert,
  on,
  computed,
  observer
  } = Ember;

export default Component.extend(MagicArrayMixin, OcclusionCollectionMixin, {

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
   * If itemTagName is blank or null, the `occlusion-collection` will [tag match](../addon/utils/get-tag-descendant.js)
   * with the `OcclusionItem`.
   */
  tagName: 'occlusion-collection',

  /**!
   * Used if you want to explicitly set the tagName of `OcclusionItem`s
   */
  itemTagName: '',

  //–––––––––––––– Performance Tuning

  /**!
   * If true, dynamic height calculations are skipped and
   * `defaultHeight` is always used as the height of each
   * `OccludedView`.
   */
    // TODO alwaysUseDefaultWidth
  alwaysUseDefaultHeight: false,




  _getChildren: function() {
    var eachList = Ember.A(this._childViews[0]);
    var childViews = [];
    eachList.forEach(function(virtualView){
      childViews.push(virtualView._childViews[0]);
    });
    return childViews;
  },

  // on scroll, determine component states
  /**!
   *
   * The big question is can we render from the bottom
   * without the bottom most item being taken off screen?
   *
   * @returns {boolean}
   * @private
   */
    // TODO this is nearly in line with the mixin version
  _updateChildStates: function () {

    if (this.get('__isPrepending') || !this.get('_hasRendered')) {
      return false;
    }

    var edges = this.get('_edges') || this._calculateEdges();
    var childComponents = this._getChildren();

    var currentViewportBound = edges.viewportTop + this.$().position().top;
    var currentUpperBound = edges.invisibleTop;

    if (currentUpperBound < currentViewportBound) {
      currentUpperBound = currentViewportBound;
    }

    var topComponentIndex = this._findFirstRenderedComponent(currentUpperBound, edges.viewportTop);
    var bottomComponentIndex = topComponentIndex;
    var lastIndex = get(childComponents, 'length') - 1;
    var topVisibleSpotted = false;

    while (bottomComponentIndex <= lastIndex) {

      var component = childComponents[bottomComponentIndex];

      var componentTop = component.$().position().top;
      var componentBottom = componentTop + component.get('_height');

      // end the loop if we've reached the end of components we care about
      if (componentTop > edges.invisibleBottom) { break; }

      //above the upper invisible boundary
      if (componentBottom < edges.invisibleTop) {
        component.cull();

        //above the upper reveal boundary
      } else if (componentBottom < edges.visibleTop) {
        component.hide();

        //above the upper screen boundary
      } else if (componentBottom < edges.viewportTop) {
        component.show();
        if (bottomComponentIndex === 0) {
          this.sendActionOnce('firstReached', {
            item: component.get('content.content'),
            index: bottomComponentIndex
          });
        }

        //above the lower screen boundary
      } else if(componentTop < edges.viewportBottom) {
        component.show();
        if (bottomComponentIndex === 0) {
          this.sendActionOnce('firstReached', {
            item: component.get('content.content'),
            index: bottomComponentIndex
          });
        }
        if (bottomComponentIndex === lastIndex) {
          this.sendActionOnce('lastReached', {
            item: component.get('content.content'),
            index: bottomComponentIndex
          });
        }

        if (!topVisibleSpotted) {
          topVisibleSpotted = true;
          this.set('_firstVisible', component);
          this.set('_firstVisibleIndex', bottomComponentIndex);
          this.sendActionOnce('firstVisibleChanged', {
            item: component.get('content.content'),
            index: bottomComponentIndex
          });
        }
        this.set('_lastVisible', component);
        this.sendActionOnce('lastVisibleChanged', {
          item: component.get('content.content'),
          index: bottomComponentIndex
        });

        //above the lower reveal boundary
      } else if (componentTop < edges.visibleBottom) {
        component.show();
        if (bottomComponentIndex === lastIndex) {
          this.sendActionOnce('lastReached', {
            item: component.get('content.content'),
            index: bottomComponentIndex
          });
        }

        //above the lower invisible boundary
      } else { // (componentTop <= edges.invisibleBottom) {
        component.hide();
      }

      bottomComponentIndex++;
    }

    var toCull = (childComponents.slice(0, topComponentIndex))
      .concat(childComponents.slice(bottomComponentIndex));

    //cull views
    toCull.forEach(function (v) { v.cull(); });

    //set scroll
    if (this.get('__isInitializingFromLast')) {
      this._taskrunner.schedule('afterRender', this, function () {
        var last = this.$().get(0).lastElementChild;
        this.set('__isInitializingFromLast', false);
        if (last) {
          last.scrollIntoView(false);
        }
      });
    }

  },





  //–––––––––––––– Setup/Teardown


  _reflectContentChanges: function() {

    var content = this.get('__content');
    var self = this;

    content.contentArrayDidChange = function handleArrayChange(items, offset, removeCount, addCount) {

      if (offset <= self.get('_firstVisibleIndex')) {
        self.__performViewPrepention(addCount);
      } else {
        self._taskrunner.schedule('render', self, self._updateChildStates);
      }

    };

  },


  init: function() {
    this._super();
    this._reflectContentChanges();
  }


});
