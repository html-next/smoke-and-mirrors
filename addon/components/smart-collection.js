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

const Collection = Component.extend({

  layout,
  items: null,
  radar: null,

  _virtualItemCache: null,
  _virtualItemArray: null,
  _activeKeysCache: null,

  createItem(options) {
    options.scalar = this.get('bufferSize');
    return this.radar.register(options);
  },

  removeItem(virtualItem) {
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
      let item = items.objectAt ? items.objectAt(index) : items[index];
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

    this.updateVirtualItems();
    this.setInitialItemState();
  }

});

Collection.reopenClass({
  positionalParams: ['items']
});

export default Collection;
