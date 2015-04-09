/*globals Ember */
import CoreContainerView from "./core-container-view";
var get = Ember.get; // import { get } from "ember-metal/property_get";
var set = Ember.set; // import { set } from "ember-metal/property_set";


function reshuffleMagicCollection() {
  var content = get(this, 'content');
  var item, itemKey, childView, currentIndex, newIndex;
  var currentView = this._firstChild;

  for (var i = 0, l = get(content, 'length'); i < l; i++) {
    item = content.objectAt(i);
    itemKey = this.keyFn(item);

    // 1) if we're already in the correct place
    if (currentView && this.keyFn(currentView.content) === itemKey) {
      currentView.set('contentIndex', i);
      currentView = currentView._nextSibling;
      // 2) if we're not in the correct place but we already are in the list, move us to the correct place
    } else if (childView = this._childViewsByKey[itemKey]) {
      this.insertBefore(childView, currentView);
      childView.set('contentIndex', i);
      // 3) otherwise we're not in the list, create us (or reuse?) a view and add us in the correct place
    } else {

      childView = this._childViewsByKey[itemKey] = this.createChildView(this.itemViewClass, {
        content: item,
        context: item,
        contentIndex: i,
        _key: itemKey
      });
      this.insertBefore(childView, currentView);

    }
  }

  // 4) remove/reuse unused views
  //when we finish the loop above, any items remaining beneath the last index ought to be removed
  //this includes currentView
  if (currentView) {

    // unlink the rest of the chain
    if (currentView._previousSibling) {
      currentView._previousSibling._nextSibling = null;
    }

    var destroyView;
    do {
      destroyView = currentView;
      currentView = currentView._nextSibling;
      destroyView.destroy();

    } while (currentView);

  }
}


var MagicCollectionView = CoreContainerView.extend({
  itemViewClass: Ember.View,

  init: function() {
    this._childViewsByKey = Object.create(null);
    this._super();
  },

  keyFn: function(obj) {
    return get(obj, 'id');
  },

  _contentDidChange: Ember.on('init', Ember.observer('content', function() {
    Ember.run.scheduleOnce('render', this, reshuffleMagicCollection);
  }))
});

export default MagicCollectionView;
