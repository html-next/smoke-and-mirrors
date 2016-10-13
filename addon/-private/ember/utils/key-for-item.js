/* global String */
import Ember from 'ember';
import identity from './identity';

const {
  get
  } = Ember;

export default function keyForItem(item, keyPath, index) {
  let key;

  switch (keyPath) {
    case '@index':
      if (!index) {
        throw new Error('No index was supplied to keyForItem');
      }
      key = index;
      break;
    case '@identity':
      key = identity(item);
      break;
    default:
      if (keyPath) {
        key = get(item, keyPath);
      } else {
        key = identity(item);
      }
  }

  if (typeof key === 'number') {
    key = String(key);
  }

  return key;
}
