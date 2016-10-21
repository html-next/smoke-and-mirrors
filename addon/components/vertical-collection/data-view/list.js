import keyForItem from '../../../-private/ember/utils/key-for-item';
import Ember from 'ember';
import Proxy from './proxy';
import Radar from './radar';
import makeDict from '../../../-private/ember/make-dict';
import RecycleContainer from './recycle-container';

const {
  get
} = Ember;

function getArray(arr) {
  if (!arr) {
    return arr;
  }

  let content = get(arr, 'content');

  return content || arr;
}

function equalsRef(ref, keyPath, index, proxy) {
  return ref === proxy.ref || keyForItem(ref, keyPath, index) === proxy.key;
}

function updateRef(ref, proxy) {
  if (ref !== proxy.ref) {
    proxy.ref = ref;
    proxy._dirtied++;
  }
}

export default class KeyList {
  constructor(dataSource, keyPath, itemHeight) {
    this.keyPath = keyPath;
    this.list = null;
    this.ordered = null;
    this._proxied = [];
    this.radar = null;
    this.itemHeight = itemHeight;
    this.lastChangeWasPrepend = false;
    this._firstItemKey = null;
    this._firstItemIndex = 0;
    this._activeCount = 0;
    this.updateList(dataSource);
  }

  // non-scroll updates
  refreshVisibleContent() {}

  // scroll updates
  updateVisibleContent() {}

  setupRadar(options) {
    this.radar = new Radar(options);

    const onScrollMethod = (dY, dX) => {
      const { ordered } = this;
      for (let i = 0; i < ordered.length; i++) {
        let geo = ordered[i].geography;

        geo.left -= dX;
        geo.right -= dX;
        geo.bottom -= dY;
        geo.top -= dY;
      }

      if (!this.lastChangeWasPrepend) {
        this.updateVisibleContent();
      }
    };

    this.radar.didScroll = onScrollMethod;

  }

  keyForItem(item, index) {
    return keyForItem(item, this.keyPath, index);
  }

  append(dataSource) {

  }

  prepend(dataSource) {

  }

  insert(dataSource, index) {

  }

  get firstActiveIndex() {
    const { list, _firstItemKey, _firstItemIndex, ordered } = this;
    let index;

    if (list) {
      if (_firstItemKey && list[_firstItemKey]) {
        this._firstItemIndex = index = list[_firstItemKey].index;
        return index;
      }
      if (ordered.length < _firstItemIndex) {
        return _firstItemIndex;
      }

      this._firstItemIndex = 0;
      return 0;
    }

    return null;
  }

  get heightAbove() {
    const { _firstItemIndex, ordered } = this;
    let i;
    let h = 0;

    for (i = 0; i < _firstItemIndex; i++) {
      h += ordered[i].height;
    }

    return h;
  }

  get heightBelow() {
    const { _firstItemIndex, ordered, _activeCount } = this;
    let len = ordered.length;
    let i;
    let h = 0;

    for (i = _firstItemIndex + _activeCount; i < len; i++) {
      h += ordered[i].height;
    }

    return h;
  }

  _isMaybePrepend(oldArray, newArray) {
    if (!oldArray || !newArray) {
      return false;
    }

    const lengthDifference = newArray.length - oldArray.length;

    // if either array is empty or the new array is not longer, do not treat as prepend
    if (!newArray.length|| !oldArray.length || lengthDifference <= 0) {
      return false;
    }

    // if the keys at the correct indexes are the same, this is a prepend
    let key = keyForItem(newArray[lengthDifference], this.keyPath, lengthDifference);

    return oldArray[0].key === key;
  }

  slice(start, end) {
    const { ordered, _activeCount } = this;

    start = start || this.firstActiveIndex;
    end = end || start + _activeCount;

    if (end < 0) {
      end = 0;
    }

    this._firstItemKey = ordered[start].key;
    this._firstItemIndex = start;
    this._activeCount = end - start;

    return ordered.slice(start, end);
  }

  updateList(dataSource) {
    const arr = getArray(dataSource);
    let { list, ordered } = this;

    this.lastChangeWasPrepend = this._isMaybePrepend(ordered, arr);

    if (!arr || !arr.length) {
      this.clear();
      return;
    }

    const { keyPath, itemHeight } = this;
    let ref;
    let i;
    let h = 0;

    if (!list) {
      this.list = list = makeDict(null);
      this.ordered = ordered = new Array(arr.length);

      for (i = 0; i < arr.length; i++) {
        ref = new Proxy(keyForItem(arr[i], keyPath, i), arr[i], itemHeight, h);
        ref.index = i;
        list[ref.key] = ref;
        ordered[i] = ref;
        h = ref.geography.bottom;
      }

      return;
    }

    let newList = makeDict(null);
    let len = arr.length;
    let key;

    ordered.length = len;

    for (i = 0; i < len; i++) {
      key = keyForItem(arr[i], keyPath, i);
      ref = list[key];

      if (ref) {
        newList[key] = list[key];
        updateRef(arr[i], ref);
        ref.index = i;
      } else {
        ref = newList[key] = new Proxy(key, arr[i], itemHeight);
        ref.index = i;
      }

      ordered[i] = ref;
    }

    this.list = newList;
  }

  clear() {
    this.list = null;
    if (this.ordered) {
      this.ordered.length = 0;
    }
  }
}
