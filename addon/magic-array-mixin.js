import Ember from "ember";
import {
  SmartObjectProxy,
  createProxiedItem
  } from "./smart-object-proxy";

export default Ember.Mixin.create({

  keyForId: null,
  content: null,
  proxied: null,

  _updateProxy: Ember.observer('proxied', 'proxied.@each', function computeMagicArray() {

    var proxied = this.get('proxied');
    var key = this.get('keyForId');
    var content = this.get('content');

    this.beginPropertyChanges();

    // create a new array object if we don't have one yet
    if (proxied) {

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

    var newLength = proxied ? proxied.length : 0;

    while (newLength < content.length) {
      content.removeAt(content.length - 1);
    }

    this.endPropertyChanges();

  })


});
