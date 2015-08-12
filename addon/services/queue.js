import Ember from 'ember';
import enhancedDeferred from '../utils/enhanced-deferred';

const {
  computed,
  Service,
  RSVP,
  get: get,
  run,
  generateGuid,
  guidFor
  } = Ember;

const QUEUE_ID_PREFIX = 'queue-item-';

function getRejected(e) {
  return new RSVP.Promise((resolve, reject)=> {
    reject(e);
  });
}

export default Service.extend({

  concurrentProcesses: 3,
  info: computed('_count', '_queue.length', '_activeProcesses', function() {
    var length = this.get('_queue.length');
    var count = this.get('_count');
    var active = this.get('_activeProcesses');
    return {
      length: length,
      count: count,
      active: active,
      current: count - length - active
    };
  }),

  push: function(item) {
    item = this._itemForQueue(item);
    let guid = guidFor(item);
    // async nature ensures an error here doesn't carry over to the source
    run.next(this, () => {
      this.get('_queue').pushObject(item);
      this.incrementProperty('_count');
      this._emptyQueue();
    });
    return guid;
  },

  unshift: function(item) {
    item = this._itemForQueue(item);
    let guid = guidFor(item);
    // async nature ensures an error here doesn't carry over to the source
    run.next(this, () => {
      this.get('_queue').unshiftObject(item);
      this.incrementProperty('_count');
      this._emptyQueue();
    });
    return guid;
  },

  _itemForQueue(item) {
    item = this.itemForQueue(item);
    let guid = get(item, '_guid');
    if (!guid) {
      generateGuid(item, QUEUE_ID_PREFIX);
    }
    return item;
  },

  itemForQueue(item) {
    return item;
  },

  // override to handle an item in the queue, should return a promise
  _process(item) {
    let promise = this.process(item);
    let deferred = enhancedDeferred();
    promise.then(deferred.resolve, deferred.reject);
    return {
      _guid: guidFor(item),
      item: item,
      promise: promise,
      deferred: deferred
    };
  },

  // must return a promise
  process: function() {
    Ember.Logger.warn("you invoked a queues process method, but never defined it.");
    return getRejected();
  },

  // override to handle the return process failure, returning the item pushes
  // it back onto the queue
  handleFailure: function(item) {
    return item;
  },

  dismiss(id) {
    let item = this._itemForId(id);
    if (item) {
      this.get('_queue').removeObject(item);
      return true;
    }
    item = this._itemFromProcessing(id);
    if (item) {
      return this._removeItemFromProcessing(item);
    }
    return false;
  },

  _removeItemFromProcessing(activeQueueItem) {
    // remove from queue
    let deck = this.get('_deck');
    deck.removeObject(activeQueueItem);

    // cancel the deferred
    activeQueueItem.deferred.reject();

    // let the consumer do something
    return this.removeItemFromProcessing(activeQueueItem);
  },

  removeItemFromProcessing(/*activeQueueItem*/) {
    return true;
  },

  _itemFromProcessing(id) {
    return this._getItem(this.get('_deck'), id);
  },
  _itemForId(id) {
    return this._getItem(this.get('_queue'), id);
  },
  _getItem(arr, id) {
    let match = null;
    arr.forEach((item) => {
      if (guidFor(item) === id) {
        match = item;
      }
    });
    return match;
  },

  _queue: null,
  _deck: null,
  _count: 0,

  _activeProcesses: 0,
  _emptyQueue: function() {
    let queue = this.get('_queue');
    let deck = this.get('_deck');
    let N = this.get('concurrentProcesses');
    let A = N - this.get('_activeProcesses');
    let item;

    while(A-- && (item = queue.popObject())) {
      this.incrementProperty('_activeProcesses');
      let activeQueueItem = this._process(item);
      deck.pushObject(activeQueueItem);
      let promise = activeQueueItem.deferred;
      promise.then(
        () => {
          this.decrementProperty('_activeProcesses');
          deck.removeObject(item);
          this._emptyQueue();
        },
        // allow rejected items to be re-queued
        (error) => {
          this.decrementProperty('_activeProcesses');
          deck.removeObject(item);
          let rejectedItem = this.handleFailure(item, error);
          if (rejectedItem) {
            this.push(rejectedItem);
          }
        })
        .finally(() => {
          // count increments until we're out of items to process
          if (!this.get('_queue.length')) {
            this.set('_count', 0);
          }
        });
    }

  },

  init: function() {
    this._super();
    this.set('_queue', Ember.A());
    this.set('_deck', Ember.A());
  }

});
