import Ember from "ember";
import SmartObjectProxy from "../utils/smart-object-proxy";

var Mixin = Ember.Mixin.create({

  keyForId: null,
  contentToProxy: null,
  __proxyContentTo: 'content',

  _updateProxy: Ember.observer('contentToProxy', 'contentToProxy.@each', function computeProxiedArray() {

    var proxied = this.get('contentToProxy');
    var key = this.get('keyForId');
    var prop = this.get('__proxyContentTo');
    var content;
    var newLength;
    var newObjects = [];
    var diff;

    // play nice with arrays that are already proxied
    if (proxied.get('content')) {
      proxied = proxied.get('content');
    }

    if (!this.get(prop)) {
      content = Ember.ArrayProxy.create({ content: Ember.A() });
      this.set(prop, content);
    } else {
      content = this.get(prop);
    }

    this.beginPropertyChanges();

    // create a new array object if we don't have one yet
    if (proxied) {

      // handle additions to the beginning of the array
      if (this._changeIsPrepend(proxied, content, key)) {

        newLength = Ember.get(proxied, 'length');
        var i = 0;
        diff = newLength - content.get('length');
        for (i = 0; i < diff; i++) {
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

  }),

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

  init: function() {
    this._super.apply(this, arguments);
    this._updateProxy();
  }

});

export default Mixin;
