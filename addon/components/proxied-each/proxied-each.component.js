import Ember from "ember";
import MagicArrayMixin from "../../mixins/magic-array";

export default Ember.CollectionView.extend(MagicArrayMixin, {

  keyForId: null,

  tagName: '',

  init: function() {
    if (!this.get('content')) {
      this.set('content', Ember.A());
    }
    this._updateProxy();
    this._super.apply(this, arguments);
  }

});
