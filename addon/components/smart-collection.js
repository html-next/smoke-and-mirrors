import Ember from 'ember';
import keyForItem from '../utils/key-for-item';
import ListRadar from '../models/list-radar';
import layout from '../templates/components/smart-collection';

const {
  Component,
  computed,
  observer,
  get
  } = Ember;

const {
  SafeString
  } = Ember.Handlebars;

const Collection = Component.extend({
  layout,
  // tagName: 'vertical-collection',

  // you available as a positionalParam
  items: null,

  /*
   * Each collection implement's it's own `radar` instance
   * and uses it to track the position and dimensions of items
   * in the collection.
   */
  radar: null,
  containerSelector: null,
  itemDimensions: null,
  trustDefaultDimensions: false,

  key: '@identity',

  _virtualItemCache: null,
  _virtualItemArray: null,
  _activeKeysCache: null,

  _spacerAbove: null,
  _spacerAboveStyle: computed('spacerAbove.width', 'spacerAbove.height', function() {
    let dim = this.get('spacerAbove');
    return new SafeString(`width: ${dim.width}; height: ${dim.height};`);
  }),
  spacerAbove: computed({
    get() {
      if (!this._spacerAbove) {
        this._spacerAbove = {
          height: '0px',
          width: '100%'
        };
      }
      return this._spacerAbove;
    },
    set(v) {
      if (v) {
        if (v.hasOwnProperty('height')) {
          let height = v.height || 0;
          this._spacerAbove.height = `${height}px`;
        } else if (v.hasOwnProperty('width')) {
          this._spacerAbove.width = `${v.width}px` || (v.width === '0px' ? 0 : '100%');
        } else {
          let height = v || 0;
          this._spacerAbove.height = `${height}px`;
        }
      } else {
        this._spacerAbove = {
          height: '0px',
          width: '100%'
        };
      }
    }
  }),

  _spacerBelow: null,
  _spacerBelowStyle: computed('spacerBelow.width', 'spacerBelow.height', function() {
    let dim = this.get('spacerBelow');
    return new SafeString(`width: ${dim.width}; height: ${dim.height};`);
  }),
  spacerBelow: computed({
    get() {
      if (!this._spacerBelow) {
        this._spacerBelow = {
          height: '0px',
          width: '100%'
        };
      }
      return this._spacerBelow;
    },
    set(v) {
      if (v) {
        if (v.hasOwnProperty('height')) {
          let height = v.height || 0;
          this._spacerBelow.height = `${height}px`;
        } else if (v.hasOwnProperty('width')) {
          this._spacerBelow.width = `${v.width}px` || (v.width === '0px' ? 0 : '100%');
        } else {
          let height = v || 0;
          this._spacerBelow.height = `${height}px`;
        }
      } else {
        this._spacerBelow = {
          height: '0px',
          width: '100%'
        };
      }
    }
  }),

  createItem(options) {
    options.scalar = this.get('bufferSize');
    const virtualItem = this.radar.register(options);
    virtualItem.zonesDidChange = (dX, dY, zones) => {
      console.log('zone change!', virtualItem.key, dX, dY, zones);
    };
    return virtualItem;
  },

  removeItem(virtualItem) {
    virtualItem.zonesDidChange = null;
    this.radar.unregister(virtualItem);
  },

  updateItem(virtualItem, options) {
    virtualItem.update(options);
    // let oldIndex = virtualItem.get('index');
    // if (index !== oldIndex) {
    //
    // }
    // virtualItem.setProperties(options);
  },

  updateVirtualItems: observer('items.[]', function() {
    const virtualItems = this._virtualItemCache;
    const keyCache = this._activeKeysCache;
    const items = this.get('items');
    const itemLength = items ? get(items, 'length') : 0;
    const keyPath = this.get('key');

    const activeKeys = [];

    // check mass removal or null array
    if (!items || !itemLength) {
      while (keyCache.length) {
        let key = keyCache.pop();
        let virtualItem = virtualItems.get(key);
        virtualItems.delete(key);
        this.removeItem(virtualItem);
      }
      this._activeKeysCache = [];
      return;
    }

    // calculate updates and insertions
    let previousItem = null;
    for (let index = 0; index < itemLength; index++) {
      let item = getIndex(items, index);
      let key = keyForItem(item, keyPath, index);
      let virtualItem = virtualItems.get(key);

      activeKeys.push(key);

      if (!virtualItem) {
        virtualItem = this.createItem({
          item,
          key,
          index,
          previousItem
        });
        virtualItems.set(keyPath, virtualItem);
      } else {
        this.updateItem(virtualItem, {
          item,
          index,
          previousItem
        });
      }

      previousItem = virtualItem;
    }

    // remove outdated items
    for (let index = 0; index < keyCache.length; index++) {
      if (activeKeys.indexOf(keyCache[index]) === -1) {
        let virtualItem = virtualItems.get(keyCache[index]);
        virtualItems.delete(keyCache[index]);
        this.removeItem(virtualItem);
      }
    }

    this._activeKeysCache = activeKeys;
  }),

  _renderQueue: null,
  queueItemRender(virtualItem) {
    this._renderQueue.push(virtualItem);
  },

  _rendered: null,
  flushRenderQueue() {

  },

  bufferSize: 0.25,
  resizeDebounce: 16,
  minimumMovement: 15,
  didInsertElement() {
    let containerSelector = this.get('containerSelector');

    let container;
    if (containerSelector === 'body') {
      container = window;
    } else {
      container = containerSelector ? this.$().closest(containerSelector).get(0) : this.element.parentNode;
    }

    this.radar.setState({
      telescope: container,
      resizeDebounce: this.resizeDebounce,
      sky: container === window ? document.body : this.element,
      minimumMovement: this.minimumMovement
    });

  },

  idForFirstItem: null,
  setInitialItemState() {
    if (this.get('items.length')) {
      const virtualItems = this._virtualItemCache;
      const keyPath = this.get('key');
      let idForFirst = this.get('idForFirstItem');

      if (!idForFirst) {
        idForFirst = get(getIndex(this.get('items'), 0), keyPath);
      }

      this.radar.scrollToKey(virtualItems.get(idForFirst), true);
    }
  },

  itemsRendered: null,
  itemsAbove: null,
  itemsBelow: null,

  init() {
    this._super();
    this._virtualItemCache = new Map();
    this._activeKeysCache = [];
    this._virtualItemArray = [];
    this._renderQueue = [];
    this._rendered = null;

    this.itemsRendered = Ember.A();
    this.itemsAbove = Ember.A();
    this.itemsBelow = Ember.A();

    this.radar = new ListRadar();
    this.radar.didShiftSatellites = () => {
      this.flushRenderQueue();
    };

    this.updateVirtualItems();
    this.setInitialItemState();
    window.SmartCollection = this;
  }

});

function getIndex(array, index) {
  if (!array) {
    return null;
  }
  return array.objectAt ? array.objectAt(index) : array[index];
}

Collection.reopenClass({
  positionalParams: ['items']
});

export default Collection;
