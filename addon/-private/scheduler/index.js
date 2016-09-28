import Ember from 'ember';

const {
  run
} = Ember;

export class Scheduler {
  constructor() {
    this.sync = [];
    this.layout = [];
    this.measure = [];
    this.affect = [];
    this._nextFlush = null;
  }

  schedule(queueName, cb) {
    let index = this[queueName].length;

    this[queueName].push(cb);
    this._flush();

    return index;
  }

  forget(/* token */) {}

  _flush() {
    if (this._nextFlush !== null) {
      return;
    }

    this._nextFlush = requestAnimationFrame(() => {
      this._nextFlush = null;
      this.flush();
    });
  }

  flush() {
    run.begin();
    let i;
    for (i = 0; i < this.sync.length; i++) {
      run.schedule('actions', this.sync[i]);
      this.sync[i] = undefined;
    }
    this.sync.length = 0;

    for (i = 0; i < this.layout.length; i++) {
      run.schedule('actions', this.layout[i]);
      this.layout[i] = undefined;
    }
    this.layout.length = 0;

    for (i = 0; i < this.affect.length; i++) {
      run.schedule('afterRender', this.affect[i]);
      this.affect[i] = undefined;
    }
    this.affect.length = 0;

    for (i = 0; i < this.measure.length; i++) {
      run.schedule('afterRender', this.measure[i]);
      this.measure[i] = undefined;
    }
    this.measure.length = 0;
    run.end();
  }
}

export default new Scheduler();
