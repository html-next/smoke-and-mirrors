import Ember from 'ember';

const {
  computed,
  guidFor,
  get: get,
  ObjectProxy
  } = Ember;

function identity(item) {
  let key;
  let type = typeof item;

  if (type === 'string' || type === 'number') {
    key = item;
  } else {
    key = guidFor(item);
  }

  return key;
}

export default Ember.Mixin.create({

  loadAbove() {
    let index = this.get('endIndex');
    let length = this.get('content.length') - 1;
    let adj = this.get('itemsPerLoad');

    if (index !== length) {
      index += adj;
      if (index > length) {
        index = length;
      }
      this.set('endIndex', index);
    }

    return index !== length;
  },

  loadBelow() {
    let index = this.get('startIndex');
    let adj = this.get('itemsPerLoad');

    if (index !== 0) {
      index -= adj;
      if (index < 0) {
        index = 0;
      }
      this.set('startIndex', index);
    }

    return !!index;
  },

  key: '@identity',
  keyForValue: function(item, index) {
    let key;
    let keyPath = this.get('key');

    switch (keyPath) {
      case '@index':
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
  },

  startIndex: 0,
  _end: 0,
  endIndex: computed('content.length', 'itemsPerLoad', 'startIndex', '_stage.length', {
    get() {
      let _end = this._end;
      if (!_end) {
        let available = this.get('content.length') - 1;
        let had = this.get('_stage.length');
        let start = this.get('startIndex');
        let slack = this.get('itemsPerLoad');

        _end = start + (had || slack);
        if (_end > available) {
          _end = available;
        }
        this._end = _end;
      }
      return _end;
    },
    set(v) {
      let available = this.get('content.length') - 1;
      if (v > available) {
        v = available;
      }
      this._end = v;
      return v;
    }
  }),
  itemsPerLoad: 10,

  content: null,

  _stage: null,
  stage: computed('content.[]', 'startIndex', 'endIndex', function() {

    let cache = this.get('__cache') || {};
    let inbound = this.get('content');
    let outbound = this.get('_stage');
    let staged = Ember.A();
    let start = this.get('startIndex');
    let end = this.get('endIndex');
    let newCache = {};
    let deletions = [];

    if (!outbound) {
      outbound = Ember.A();
      this.set('_stage', outbound);
    }

    if (!inbound) {
      return outbound;
    }

    this.beginPropertyChanges();

    let inbound = inbound.slice(start, end);

    inbound.forEach((item, index) => {
      let key = this.keyForValue(item, start + index);
      let obj = cache[key] || ObjectProxy.create();
      obj.set('content', item);
      let i = newCache[key] = obj;
      staged.push(i);
    });

    // prune old objects
    outbound.forEach((item, index) => {
      let key = get(item, keyForId);
      let i = newCache[key];
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
      let key = get(item, keyForId);
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


    this.set('__cache', newCache);

    this.endPropertyChanges();

    return outbound;
  }),

  __cache: null


});
