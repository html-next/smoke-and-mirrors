import Ember from 'ember';
import keyForItem from '../-private/ember/utils/key-for-item';

const {
  computed,
  ArrayProxy,
  ObjectProxy,
  get
} = Ember;

function valueForIndex(arr, index) {
  return arr.objectAt ? arr.objectAt(index) : arr[index];
}

function changeIsPrepend(oldArray, newArray, keyPath) {
  const lengthDifference = get(newArray, 'length') - get(oldArray, 'length');

  // if either array is empty or the new array is not longer, do not treat as prepend
  if (!get(newArray, 'length') || !get(oldArray, 'length') || lengthDifference <= 0) {
    return false;
  }

  // if the keys at the correct indexes are the same, this is a prepend
  const oldInitialItem = get(valueForIndex(oldArray, 0), 'content');
  const oldInitialKey = keyForItem(oldInitialItem, keyPath, 0);
  const newInitialItem = valueForIndex(newArray, lengthDifference);
  const newInitialKey = keyForItem(newInitialItem, keyPath, lengthDifference);

  return oldInitialKey === newInitialKey;
}

export default function proxiedArray(arrayKey, keyPath = '@identity') {
  // create the value cache for the array
  const outbound = ArrayProxy.create({ content: Ember.A() });

  // create the computed args array
  const args = [];

  args.push(arrayKey.indexOf('.[]') !== -1 ? arrayKey : `${arrayKey}.[]`);

  const fn = () => {
    const inbound = this.get(arrayKey);

    if (!inbound || !get(inbound, 'length')) {
      outbound.clear();
      return outbound;
    }
    let newLength;
    const newObjects = Ember.A();
    let diff;

    outbound.beginPropertyChanges();

    // handle additions to the beginning of the array
    if (changeIsPrepend(outbound, inbound, keyPath)) {
      newLength = get(inbound, 'length');
      diff = newLength - outbound.get('length');
      for (let i = 0; i < diff; i++) {
        newObjects.push(ObjectProxy.create({ content: inbound[i] }));
      }
      if (newObjects.length) {
        outbound.replace(0, 0, newObjects);
      }

    // handle additions and inline changes
    } else {
      inbound.forEach((item, index) => {
        const proxiedObject = outbound.objectAt(index);

        if (proxiedObject) {
          proxiedObject.set('content', item);
        } else {
          newObjects.push(ObjectProxy.create({ content: item }));
        }
      });

      if (newObjects.length) {
        outbound.pushObjects(newObjects);
      }
    }

    newLength = inbound ? get(inbound, 'length') : 0;

    if (newLength < outbound.get('length')) {
      diff = outbound.get('length') - newLength;
      outbound.removeAt(newLength, diff);
    }

    outbound.endPropertyChanges();
    outbound.notifyPropertyChange('length');
    return outbound;
  };

  args.push(fn);
  return computed.apply(this, args);
}
