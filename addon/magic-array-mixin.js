import Ember from "ember";
import {
  SmartObjectProxy,
  createProxiedItem
  } from "./smart-object-proxy";

export default Ember.Mixin.create({

  content: null,

  keyForId: null,
  __magicArray: null,

  magicArray: Ember.computed('content', 'content.@each', function computeMagicArray() {

    console.log('making magicArray');

    var content = this.get('content');
    var key = this.get('keyForId');
    var magicArray = this.get('__magicArray');

    // create a new array object if we don't have one yet
    if (!magicArray) {

      console.log('initializing new magicarray');
      var length = content ? content.length : 0;

      magicArray = new Array(length);
      this.set('__magicArray', magicArray);

      if (content) {
        content.forEach(function(item) {
          magicArray.push(createProxiedItem(item, key));
        });
      }


      // reuse the existing array of proxied items
    } else {

      console.log('reusing!');

      if (content) {

        content.forEach(function(item, index) {

          var proxiedObject = magicArray[index];
          if (proxiedObject) {
            proxiedObject.set('content', item);
            proxiedObject.__updateIndex();
          } else {
            magicArray.push(createProxiedItem(item, key));
          }

        });

        while (content.length < magicArray.length) {
          magicArray.pop();
        }

        //null the array
      } else {
        magicArray.length = 0;
        //TODO probably need som GC here
      }

    }

    console.log('made magicArray', magicArray);
    return magicArray;
  }).readOnly()


});
