import Ember from 'ember';

const {
  compare,
  get: get
  } = Ember;

export default function(array, sortKeys) {
  return array.sort(function(a, b) {
    for (let i = 0; i < sortKeys.length; i++) {
      let key = sortKeys[i];
      let propA = get(a, key);
      let propB = get(b, key);

      // return 1 or -1 else continue to the next sortKey
      let compareValue = compare(propA, propB);

      if (compareValue) {
        return compareValue;
      }
    }
    return 0;
  });
}
