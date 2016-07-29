import Ember from 'ember';
import FastArray from 'perf-primitives/fast-array';

const {
  run: emberRun,
  beginPropertyChanges,
  endPropertyChanges
  } = Ember;

function Token() { this.cancelled = false; }

class Igniter {
  constructor() {
    // determine new state
    this.measure = new FastArray(10);

    // set new state
    this.affect = new FastArray(10);

    // perform any post-render cleanup
    this.cleanup = new FastArray(10);
    this._nextFlush = false;
  }

  schedule(queueName, callback) {
    if (!this._nextFlush) {
      emberRun.join(() => { this._scheduleRaf(); });
      this._nextFlush = true;
    }

    let token = new Token();
    this[queueName].push({
      token,
      callback
    });

    return token;
  }

  _scheduleRaf() {
    this._nextFlush = requestAnimationFrame(() => {
      this.flush();
      this._nextFlush = false;
    });
  }

  flush() {
    beginPropertyChanges();
    this.measure.emptyEach((job) => {
      if (!job.token.cancelled) {
        job.call(undefined);
      }
    });

    emberRun.begin();

    this.affect.emptyEach((job) => {
      if (!job.token.cancelled) {
        job.call(undefined);
      }
    });
    endPropertyChanges();

    emberRun.schedule('destroy', () => {
      this.cleanup.emptyEach((job) => {
        if (!job.token.cancelled) {
          job.call(undefined);
        }
      });
    });

    emberRun.end();
  }
}

const igniterRun = new Igniter();

class TaskRunner {
  constructor() {
    this.cancelled = false;
    this.tokens = new FastArray(10);
  }

  schedule(queueName, callback) {
    let token = igniterRun.schedule(queueName, callback);
    this.tokens.push(token);

    return token;
  }

  destroy() {
    this.cancelled = true;
    this.tokens.emptyEach((token) => {
      token.cancelled = true;
    });
    this.tokens = undefined;
  }
}

export {
  igniterRun as run,
  TaskRunner,
  Igniter
};

export default Igniter;
