import Ember from "ember";
import {
  SmartObjectProxy,
  createProxiedItem
  } from "./smart-object-proxy";

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

    if (!this.get(prop)) {
      content = Ember.A();
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
        while (newLength > content.length) {
          content.insertAt(createProxiedItem(proxied[i], key), i);
          i++;
        }

      // handle additions and inline changes
      } else {

        proxied.forEach(function(item, index) {
          var proxiedObject = content.objectAt(index);
          if (proxiedObject) {
            proxiedObject.set('content', item);
            proxiedObject.__updateIndex();
          } else {
            content.addObject(createProxiedItem(item, key));
          }

        });

      }

    }

    newLength = proxied ? proxied.length : 0;

    while (newLength < content.length) {
      content.removeAt(content.length - 1);
    }

    this.endPropertyChanges();

  }).on('init'),

  _changeIsPrepend: function(proxiedArray, newArray, key) {

    var lengthDifference = proxiedArray.length - newArray.length;

    // if either array is empty or the new array is not longer, do not treat as prepend
    if (!proxiedArray.length || !newArray.length || lengthDifference >= 0) {
      return false;
    }

    // if the object at the right key is the same, this is a prepend
    var oldInitialItem = proxiedArray[0].get('__key');
    var newInitialItem = Ember.get(newArray[-lengthDifference], key);
    return oldInitialItem === newInitialItem;

  }

});

window.MagicArrayMixin = Mixin;

export default Mixin;
