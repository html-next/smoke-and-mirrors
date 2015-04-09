import Ember from "ember";

var SmartObjectProxy = Ember.ObjectProxy.extend({

  __key: null,
  __indexPath: null,
  __isIndexable: true,
  __updateIndex: function () {

    var content = this.get('content');
    var key = this.get('__indexPath');
    var index;
    var isIndexable = true;

    if (key) {
      index = Ember.get(content, key);
    } else {

      if (!index) {
        index = Ember.guidFor(content);
      }

      if (!index) {
        index = Ember.get(content, 'id');
      }

      if (!index) {
        index = Ember.guidFor(this);
        isIndexable = false;
      }

    }

    this.setProperties({
      __key: index,
      __isIndexable: isIndexable
    });

  }

});

var createProxiedItem = function createProxiedItem(content, key) {

  var obj = SmartObjectProxy.create({
    content: content,
    __indexPath: key
  });

  obj.__updateIndex();

  return obj;

};

export {
  SmartObjectProxy,
  createProxiedItem
};

export default SmartObjectProxy;
