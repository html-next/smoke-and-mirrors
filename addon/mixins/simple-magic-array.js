import Ember from "ember";

const {
  computed,
  ArrayProxy,
  A
  } = Ember;

function computeProxiedArray() {
  var inbound = this.get('contentToProxy');
  var outbound = this.get('__proxyContent');
  outbound.set('content', A(inbound));
  return outbound;
}



var Mixin = Ember.Mixin.create({

  keyForId: null,

  _proxyContentTo: '__content',

  __proxyContent: null,

  _changeIsPrepend: function(newArray, proxiedArray, key) {

    var lengthDifference = proxiedArray.get('length') - Ember.get(newArray, 'length');

    // if either array is empty or the new array is not longer, do not treat as prepend
    if (!proxiedArray.get('length') || !Ember.get(newArray, 'length') || lengthDifference >= 0) {
      return false;
    }

    // if the object at the right key is the same, this is a prepend
    var oldInitialItem = proxiedArray.objectAt(0).get(key);

    var newInitialItem = Ember.get(newArray[-lengthDifference], key);
    return oldInitialItem === newInitialItem;

  },

  _initializeMagicArray: function(context, args, _super) {
    var dest = this.get('_proxyContentTo');

    this.set('__proxyContent', ArrayProxy.create({ content: A() }));
    this.set(dest, computed('contentToProxy', 'contentToProxy.@each', computeProxiedArray));
    _super.apply(context, args);
  },

  init: function() {
    this._initializeMagicArray(this, arguments, this._super);
  }

});

export default Mixin;
