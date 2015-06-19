import Ember from "ember";
import SmartObjectProxy from "../utils/smart-object-proxy";

const {
  computed,
  ArrayProxy
  } = Ember;

function computeProxiedArray() {

  var proxied = this.get('content');
  var key = this.get('keyForId');
  var content = this.get('__proxyContent');
  var newLength;
  var newObjects = Ember.A();
  var diff;

  // play nice with arrays that are already proxied
  if (proxied.get && proxied.get('content')) {
    proxied = proxied.get('content');
  }

  this.beginPropertyChanges();

  // create a new array object if we don't have one yet
  if (proxied) {

    // handle additions to the beginning of the array
    if (this._changeIsPrepend(proxied, content, key)) {

      newLength = Ember.get(proxied, 'length');
      diff = newLength - content.get('length');
      for (var i = 0; i < diff; i++) {
        newObjects.push(SmartObjectProxy.create({content: proxied[i], __indexPath: key}));
      }
      if (newObjects.length) {
        content.replace(0, 0, newObjects);
      }

      // handle additions and inline changes
    } else {

      proxied.forEach(function(item, index) {
        var proxiedObject = content.objectAt(index);
        if (proxiedObject) {
          proxiedObject.__update(item);
        } else {
          newObjects.push(SmartObjectProxy.create({content: item, __indexPath: key}));
        }
      });

      if (newObjects.length) {
        content.pushObjects(newObjects);
      }

    }

  }

  newLength = proxied ? Ember.get(proxied, 'length') : 0;

  if (newLength < content.get('length')) {
    diff = content.get('length') - newLength;
    content.removeAt(newLength, diff);
  }

  this.endPropertyChanges();

  return content;

}



var Mixin = Ember.Mixin.create({

  keyForId: null,

  content: null,

  _proxyContentTo: '__content',

  __proxyContent: null,

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
    this._initializeMagicArray();
    this._super.apply(this, arguments);
  }

});

export default Mixin;
