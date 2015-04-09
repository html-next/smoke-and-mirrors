import Ember from "ember";
import {
  SmartObjectProxy,
  createProxiedItem
  } from "../utils/smart-object-proxy";

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

        newLength = proxied.length;
        var i = 0;
        var diff = newLength - content.get('length');
        for (i = 0; i < diff; i++) {
          newObjects.push(createProxiedItem(proxied[i], key));
        }
        if (newObjects.length) {
          content.replace(0, 0, newObjects);
        }

      // handle additions and inline changes
      } else {

        proxied.forEach(function(item, index) {
          var proxiedObject = content.objectAt(index);
          if (proxiedObject) {
            proxiedObject.set('content', item);
            proxiedObject.__updateIndex();
          } else {
            newObjects.push(createProxiedItem(item, key));
          }
        });

        if (newObjects.length) {
          content.pushObjects(newObjects);
        }

      }

    }

    newLength = proxied ? proxied.length : 0;

    if (newLength < content.get('length')) {
      var diff = content.get('length') - newLength;
      content.removeAt(newLength, diff);
    }

    this.endPropertyChanges();

  }).on('init'),

  _changeIsPrepend: function(newArray, proxiedArray, key) {

    var lengthDifference = proxiedArray.get('length') - newArray.length;

    // if either array is empty or the new array is not longer, do not treat as prepend
    if (!proxiedArray.get('length') || !newArray.length || lengthDifference >= 0) {
      return false;
    }

    // if the object at the right key is the same, this is a prepend
    var oldInitialItem = proxiedArray.objectAt(0).get('__key');
    var newInitialItem = Ember.get(newArray[-lengthDifference], key);
    return oldInitialItem === newInitialItem;

  }

});

export default Mixin;
