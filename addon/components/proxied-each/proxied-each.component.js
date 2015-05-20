import Ember from "ember";
import MagicArrayMixin from "../../mixins/magic-array";

export default Ember.CollectionView.extend(MagicArrayMixin, {

  keyForId: null,

  tagName: ''

});
