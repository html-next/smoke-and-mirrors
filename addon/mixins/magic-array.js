import Ember from 'ember';
import keyMixin from '../mixins/key-for-item';

const {
  ArrayProxy,
  computed,
  get: get,
  Mixin,
  ObjectProxy
  } = Ember;

export default Mixin.create(keyMixin, {

  useDiffing: false,

  content: null,
  _content: computed('content.[]', computeProxiedArray),
  __content: null,
  __cache: null,

  _changeIsPrepend(newArray, proxiedArray, keyPath) {
    let lengthDifference = proxiedArray.get('length') - get(newArray, 'length');

    // if either array is empty or the new array is not longer, do not treat as prepend
    if (!proxiedArray.get('length') || !get(newArray, 'length') || lengthDifference >= 0) {
      return false;
    }

    // if the object at the right key is the same, this is a prepend
    let oldKey = this.keyForItem(proxiedArray.objectAt(0), keyPath, 0);
    let newKey = this.keyForItem(newArray[-lengthDifference], keyPath, 0);

    return oldKey === newKey;
  },

  init() {
    this._super.apply(this, arguments);
    this.set('__content', ArrayProxy.create({ content: Ember.A() }));
    this.set('__cache', {});
  }

});


function mergeDiffedArrays() {
  let inbound = this.get('content');
  let outbound = this.get('__content');
  let cache = this.get('__cache');
  let newList = {};
  let staged = Ember.A();
  let deletions = [];

  this.beginPropertyChanges();

  if (!inbound) {
    return outbound;
  }

  inbound.forEach((item, index) => {
    let key = this.keyForItem(item, index);
    let obj = cache[key] || ObjectProxy.create();
    obj.set('content', item);
    let i = newList[key] = obj;
    staged.push(i);
  });

  // prune old objects
  outbound.forEach((item, index) => {
    let key = this.keyForItem(item, index);
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
    let key = this.keyForItem(item, index);
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

  let inbound = this.get('content');
  let key = this.get('key');
  let outbound = this.get('__content');
  let newLength;
  let newObjects = Ember.A();
  let diff;

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
      for (let i = 0; i < diff; i++) {
        newObjects.push(ObjectProxy.create({content: inbound[i]}));
      }
      if (newObjects.length) {
        outbound.replace(0, 0, newObjects);
      }

      // handle additions and inline changes
    } else {

      inbound.forEach((item, index) => {
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


