import Ember from 'ember';
import keyForItem from '../utils/key-for-item';

const {
  computed,
  ArrayProxy,
  ObjectProxy
  } = Ember;

export default function diffedArray(arrayKey, keyPath = '@identity') {
  // create the value cache for the array
  const outbound = ArrayProxy.create({ content: Ember.A() });
  let cache = {};

  // create the computed args array
  const args = [];

  args.push(arrayKey.indexOf('.[]') !== -1 ? arrayKey : arrayKey + '.[]');

  const fn = () => {
    const inbound = this.get(arrayKey);
    const newList = {};
    const staged = Ember.A();
    const deletions = [];

    if (!inbound) {
      outbound.clear();
      return outbound;
    }

    outbound.beginPropertyChanges();

    inbound.forEach((item, index) => {
      const key = keyForItem(item, keyPath, index);
      const obj = cache[key] || ObjectProxy.create();
      obj.set('content', item);
      const i = newList[key] = obj;
      staged.push(i);
    });

    // prune old objects
    outbound.forEach((item, index) => {
      let key = keyForItem(item, keyPath, index);
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
      let key = keyForItem(item, keyPath, index);
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

    cache = newList;
    outbound.endPropertyChanges();
    return outbound;
  };

  args.push(fn);
  return computed.apply(this, args);
}
