import Ember from 'ember';

const {
  compare,
  get: get
  } = Ember;

export default function(array, sortKeys) {
  return array.sort(function(a, b) {
    for (let i = 0; i < sortKeys.length; i++) {
      var key = sortKeys[i];
      var propA = get(a, key);
      var propB = get(b, key);
      // return 1 or -1 else continue to the next sortKey
      var compareValue = compare(propA, propB);

      if (compareValue) {
        return compareValue;
      }
    }
    return 0;
  });
}
