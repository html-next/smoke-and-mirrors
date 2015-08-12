import Ember from 'ember';
import QueueService from 'smoke-and-mirrors/services/queue';

const {
  RSVP
  } = Ember;

const { Promise } = RSVP;

export default Queue.extend({


  /**
   * Specifies how many queue items can be actively
   * processed at a time.
   */
  /*
  concurrentProcesses: 3,
  */

  /**
   * Called by `queue.push` to give you a chance
   * to modify the queue item before placing it
   * in the queue.
   *
   * The item you return will be assigned a guid
   * if it did not already have one.  queue.push
   * returns that guid.
   *
   * @param item
   * @returns {*}
   */
  /*
  itemForQueue(item) {
    return item;
  },
  */


  /**
   * Called during queue processing if the promise returned
   * by Queue.process rejects.  This gives you the chance
   * to handle queue failures yourself.
   *
   * Return the item or a modified item to push it back onto the queue.
   *
   * @param item
   * @param error
   * @returns {*}
   */
  /*
  handleFailure: function(item, error) {
    return item;
  },
  */

  /**
   * Called during queue processing.  This is the one hook you absolutely
   * must implement in your queue service.  This method should perform
   * whatever task your queue is meant to handle, and return a promise
   * that resolves when the task completes successfully.
   *
   * @returns {Promise}
   */
  process: function(/*item*/) {
    Ember.Logger.warn("you invoked a queues process method, but never defined it.");
    return Promise.reject();
  }

  /**
   * Called when Queue.dismiss(guid) is invoked.  This hook let's you customize
   * how to dismiss an item from the queue that's already been sent to `process`.
   *
   * The item will immediately be removed from the active queue, but may need additional
   * teardown.
   *
   * @param activeQueueItem
   * @returns Boolean true if the item has been dismissed, false if the item was not dismissed or not present.
   *
   * This should almost always return true.
   */
  /*
  removeItemFromProcessing(activeQueueItem) {
    return true;
  }
  */

});
