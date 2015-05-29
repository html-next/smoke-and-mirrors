import Ember from "ember";

const {
  get: get,
  guidFor
  } = Ember;

export default Ember.ObjectProxy.extend({

  __key: null,
  __indexPath: null,
  __isIndexable: true,
  __update: function(content) {

    if (content) {
      this.set('content', content);
      this.notifyPropertyChange('content');
    } else {
      content = this.get('content');
    }

    var key = this.get('__indexPath');
    var index;
    var isIndexable = true;

    if (key) {
      index = get(content, key);
    } else {

      if (!index) {
        index = guidFor(content);
      }

      if (!index) {
        index = get(content, 'id');
      }

      if (!index) {
        index = guidFor(this);
        isIndexable = false;
      }

    }

    this.setProperties({
      __key: index,
      __isIndexable: isIndexable
    });

  },

  init: function() {
    this.__update();
    this._super();
  }

});
