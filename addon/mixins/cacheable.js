import Ember from "ember";

export default Ember.Mixin.create({

  /**!
   *
   */
  __keyForId: null,

  //prevent view destruction
  _bustcache: false,

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
