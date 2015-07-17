import Ember from "ember";

const {
  computed,
  ArrayProxy,
  ObjectProxy,
  get: get
  } = Ember;


function mergeDiffedArrays() {
  var inbound = this.get('content');
  var outbound = this.get('__proxyContent');
  var keyForId = this.get('keyForId');
  var cache = this.get('__cache');
  var newList = {};
  var staged = Ember.A();
  var deletions = [];

  this.beginPropertyChanges();

  inbound.forEach((item, index) => {
    let key = get(item, keyForId);
    let obj = cache[key] || ObjectProxy.create();
    obj.set('content', item);
    let i = newList[key] = obj;
    staged.push(i);
  });

  // prune old objects
  outbound.forEach((item, index) => {
    let key = get(item, keyForId);
    let i = newList[key];
    if (!i) {
      deletions.push(index);
    }
  });
  while (deletions.length) {
    let index = deletions.pop();
    outbound.removeAt(index, 1);
  }

  // insert or move items
  staged.forEach((item, index) => {
    let key = get(item, keyForId);
    let old = cache[key];
    if (outbound.objectAt(index) !== item) {
      // remove
      if (old) {
        outbound.removeObject(item);
      }
      // insert
      outbound.insertAt(index, item);
    }

  });

  this.set('__cache', newList);

  this.endPropertyChanges();

  return outbound;
}

function computeProxiedArray() {

  if (this.get('useDiffing')) {
    return mergeDiffedArrays.call(this);
  }

  var inbound = this.get('content');
  var key = this.get('keyForId');
  var outbound = this.get('__proxyContent');
  var newLength;
  var newObjects = Ember.A();
  var diff;

  // play nice with arrays that are already proxied
  if (inbound && inbound.get && inbound.get('content')) {
    inbound = inbound.get('content');
  }

  this.beginPropertyChanges();

  // create a new array object if we don't have one yet
  if (inbound) {

    // handle additions to the beginning of the array
    if (this._changeIsPrepend(inbound, outbound, key)) {

      newLength = Ember.get(inbound, 'length');
      diff = newLength - outbound.get('length');
      for (var i = 0; i < diff; i++) {
        newObjects.push(ObjectProxy.create({content: inbound[i]}));
      }
      if (newObjects.length) {
        outbound.replace(0, 0, newObjects);
      }

      // handle additions and inline changes
    } else {

      inbound.forEach(function(item, index) {
        var proxiedObject = outbound.objectAt(index);
        if (proxiedObject) {
          proxiedObject.set('content', item);
        } else {
          newObjects.push(ObjectProxy.create({content: item}));
        }
      });

      if (newObjects.length) {
        outbound.pushObjects(newObjects);
      }

    }

  }

  newLength = inbound ? Ember.get(inbound, 'length') : 0;

  if (newLength < outbound.get('length')) {
    diff = outbound.get('length') - newLength;
    outbound.removeAt(newLength, diff);
  }

  this.endPropertyChanges();

  return outbound;

}



var Mixin = Ember.Mixin.create({

  keyForId: null,

  content: null,

  useDiffing: false,

  _proxyContentTo: '__content',

  __proxyContent: null,

  __cache: null,

  _changeIsPrepend: function(newArray, proxiedArray, key) {

    var lengthDifference = proxiedArray.get('length') - Ember.get(newArray, 'length');

    // if either array is empty or the new array is not longer, do not treat as prepend
    if (!proxiedArray.get('length') || !Ember.get(newArray, 'length') || lengthDifference >= 0) {
      return false;
    }

    // if the object at the right key is the same, this is a prepend
    var oldInitialItem = proxiedArray.objectAt(0).get('__key');

    var newInitialItem = Ember.get(newArray[-lengthDifference], key);
    return oldInitialItem === newInitialItem;

  },

  _initializeMagicArray: function() {
    var dest = this.get('_proxyContentTo');
    this.set('__proxyContent', ArrayProxy.create({ content: Ember.A() }));
    this.set(dest, computed('content', 'content.@each', computeProxiedArray));
  },

  init: function() {
    this._super.apply(this, arguments);
    this.set('__cache', {});
    this._initializeMagicArray();
  }

});

export default Mixin;
