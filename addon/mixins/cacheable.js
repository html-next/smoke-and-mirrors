import Ember from "ember";

export default Ember.Mixin.create({

  /**!
   *
   */
  __keyForId: null,

  /**!
   *
   */
  __cachedElement: null,

  //prevent view destruction
  _bustcache: false,

  /**!
   * On init, override the renderer's createElement method
   * to enable it to restore an existing element.
   *
   * @private
   */
  __watchEvent: Ember.on('init', function() {

    var renderer = this.renderer;
    var createElementSuper = renderer.createElement;

    renderer.createElement = function attemptCreateFromExisting(view, contextualElement) {

      var element = view ? view.__cachedElement : null;

      if (element) {
        return element;
      } else {
        return createElementSuper.call(renderer, view, contextualElement);
      }

    }

  }),

  /**!
   *
   */
  __cacheElement: Ember.on('willDestroyElement', function () {

    if (this.get('_bustcache')) {
      this.set('__cachedElement', null);
      return;
    }

    var element = this.get('element');
    if (element) {
      this.set('__cachedElement', element);
    }

  }),

  /**!
   * Only call the normal destroy method
   * if it's truly time to destroy the view.
   */
  destroy: function () {
    if (this.get('_bustcache')) {
      this._super();
    }
  }

});
