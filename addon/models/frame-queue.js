import nextFrame from '../utils/next-frame';

export default class FrameQueue {

  constructor(options) {
    this.queueNames = options.queueNames;
    this.queues = {};
    this.queueNames.forEach((name)=> {
      this.queues[name] = [];
    });
  }

  schedule(queueName, context, method, ...args) {
    this.queues[queueName].push([context, method, args]);
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
