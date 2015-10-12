import Ember from 'ember';

const {
  run
  } = Ember;

export default Ember.Object.extend({

  __queue: null,

  deactivated: false,

  debounce() {
    if (this.deactivated) {
      return false;
    }

    let args = [];
    for (let i = 0; i < arguments.length; i++) {
      args[i] = arguments[i];
    }

    var ref = run.debounce.apply(null, args);
    this.__queue.addObject(ref);
    return ref;
  },

  throttle() {
    if (this.deactivated) {
      return false;
    }

    let args = [];
    for (let i = 0; i < arguments.length; i++) {
      args[i] = arguments[i];
    }

    let ref = run.throttle.apply(null, args);
    this.__queue.addObject(ref);
    return ref;
  },

  schedule() {
    if (this.deactivated) {
      return false;
    }

    let args = [];
    for (let i = 0; i < arguments.length; i++) {
      args[i] = arguments[i];
    }

    let ref = run.schedule.apply(null, args);
    this.__queue.addObject(ref);
    return ref;
  },

  scheduleOnce() {
    if (this.deactivated) {
      return false;
    }

    let args = [];
    for (let i = 0; i < arguments.length; i++) {
      args[i] = arguments[i];
    }

    let ref = run.scheduleOnce.apply(null, args);
    this.__queue.addObject(ref);
    return ref;
  },

  later() {
    if (this.deactivated) {
      return false;
    }

    let args = [];
    for (let i = 0; i < arguments.length; i++) {
      args[i] = arguments[i];
    }

    let ref = run.later.apply(null, args);
    this.__queue.addObject(ref);
    return ref;
  },

  next() {
    if (this.deactivated) {
      return false;
    }

    let args = [];
    for (let i = 0; i < arguments.length; i++) {
      args[i] = arguments[i];
    }

    var ref = run.next.apply(null, args);
    this.__queue.addObject(ref);
    return ref;
  },

  cancel: function(ref) {
    var ret = run.cancel(ref);
    this.__queue.removeObject(ref);
    return ret;
  },

  cancelAll: function() {
    this.__queue.forEach(function(v) {
      run.cancel(v);
    });
    this.__queue = Ember.A();
  },

  deactivate: function() {
    this.deactivated = true;
  },

  willDestroy: function() {
    this.deactivate();
    this._super();
  },

  init() {
    this._super();
    this.__queue = Ember.A();
  }

});
