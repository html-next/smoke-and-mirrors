import Ember from 'ember';
import keyForItem from '../../utils/key-for-item';
import ListRadar from '../../models/list-radar';
import layout from './template';

const {
  Component,
  computed,
  observer,
  get
  } = Ember;

const {
  SafeString
  } = Ember.Handlebars;

const ITEM_LOCATIONS = [
  'itemsAbove',
  'itemsRendered',
  'itemsBelow'
];

const ITEM_STATES = [
  'Unknown',
  'Culled',
  'Prepared',
  'Rendered'
];

const Collection = Component.extend({
  layout,
  tagName: 'vertical-collection',

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

  spacerAbove: computed(function() {
    let items = this.get('itemsAbove.[]');
    let height = 0;
    for (let i = 0; i < items.length; i++) {
      height += items[i].geography.height;
    }
    return new SafeString(`height: ${height}px;`);
  }),

  spacerBelow: computed(function() {
    let items = this.get('itemsBelow.[]');
    let height = 0;
    for (let i = 0; i < items.length; i++) {
      height += items[i].geography.height;
      console.log('adding height', items[i]);
    }
    return new SafeString(`height: ${height}px;`);
  }),

  createItem(options) {
    options.scalar = this.get('bufferSize');
    const virtualItem = this.radar.register(options);
    virtualItem.zonesDidChange = (dX, dY, zones) => {
      let state = new Array(3);

      // 0:unknown, 1:culled (3), 2:prepared (2), 3:rendered (0, 1)
      // 0:above 1:screen 2:below

      // culled
      if (zones.y >= 2) {
        state[2] = 1;
        state[0] = 0;
      // prepared
      } else if (zones.y === 1) {
        state[2] = 2;
        state[0] = 0;
      // rendered
      } else if (zones.y === 0) {
        state[2] = 3;
        state[0] = 1;
      // prepared
      } else if (zones.y === -1) {
        state[2] = 2;
        state[0] = 2;
      } else {
        state[2] = 1;
        state[0] = 2;
      }
/*
      // culled
      if (zones.x >= 2) {
        state[2] = state[2] > 1 ? state[2] : 1;
        state[1] = 1;
        // prepared
      } else if (zones.x === 1) {
        state[2] = state[2] === 3 ? 3 : 2;
        state[1] = 1;
        // rendered
      } else if (zones.x === 0) {
        state[2] = 3;
        state[1] = 0;
      } else if (zones.x === -1) {
        state[2] = state[2] === 3 ? 3 : 2;
        state[1] = -1;
      } else {
        state[2] = state[2] > 1 ? state[2] : 1;
        state[1] = -1;
      }
*/
      let from = this._stateMap.get(virtualItem);
      let instruction = { item: virtualItem, state: { from, to: state } };
      this.queueItemRender(instruction);
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

  shouldRender: true,

  _rendered: null,
  flushRenderQueue() {
    let data = this.getProperties('itemsAbove', 'itemsBelow', 'itemsRendered');
    let move;

    while (move = this._renderQueue.shift()) {
      if (!move.state.from || move.state.from[0] !== move.state.to[0]) {
        console.log('move', move.state.from, move.state.to);
        if (move.state.from) {
          console.log('moving item from ' + ITEM_LOCATIONS[move.state.from[0]] + ' to ' + ITEM_LOCATIONS[move.state.to[0]]);
          data[ITEM_LOCATIONS[move.state.from[0]]].removeObject(move.item);
        } else {
          console.log('moving item to ' + ITEM_LOCATIONS[move.state.to[0]]);
        }
        data[ITEM_LOCATIONS[move.state.to[0]]].addObject(move.item);
      }
      this._stateMap.set(move.item, move.state.to);
    }
    this.notifyPropertyChange('spacerAbove');
    this.notifyPropertyChange('spacerBelow');
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

  _stateMap: null,

  init() {
    this._super();
    this._virtualItemCache = new Map();
    this._activeKeysCache = [];
    this._virtualItemArray = [];
    this._renderQueue = [];
    this._rendered = null;

    this._stateMap = new WeakMap();

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
