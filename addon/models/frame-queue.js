import nextFrame from '../utils/next-frame';
import Ember from 'ember';

const {
  guidFor
  } = Ember;

export default class FrameQueue {

  constructor(options) {
    this.queueNames = options.queueNames;
    this.queues = {};
    this.items = [];
    this.queueNames.forEach((name)=> {
      this.queues[name] = [];
    });
  }

  schedule(queueName, context, method, ...args) {
    let queueItem = FrameQueue._createItem(queueName, context, method, args);
    this.items.push(queueItem);
    this.queues[queueName].push(queueItem);
    return guidFor(queueItem);
  }

  findByMethod(queueName, context, method) {
    return this.items.find((i) => {
      return i.queueName === queueName &&
        i.method === method &&
        i.context === context;
    });
  }

  findByGuid(guid) {
    return this.items.find((item) => {
      return guidFor(item) === guid;
    });
  }

  static _createItem(queueName, context, method, args) {
    return {
      context,
      method,
      args,
      queueName
    };
  }

  scheduleOnce(queueName, context, method, ...args) {
    let item = this.findByMethod(queueName, method, context);
    if (item) {
      item.args = args;
    } else {
      item = FrameQueue._createItem(queueName, context, method, args);
    }
    return guidFor(item);
  }

  _remove(item) {
    this.items.splice(this.items.indexOf(item), 1);
    let queue = this.queues[item.queueName];
    queue.splice(queue.indexOf(item), 1);
  }

  cancel(guid) {
    let item = this.findByGuid(guid);
    if (!item) {
      return false;
    }
    this._remove(item);
    return true;
  }

  static flushQueue(queue) {
    let work;
    while (work = queue.pop()) {
      work[1].apply(work[0], work[2]);
    }
  }

  render() {
    return nextFrame(this, function() {
      this.queueNames.forEach((name) => {
        FrameQueue.flushQueue(this.queues[name]);
      });
    });
  }

}
