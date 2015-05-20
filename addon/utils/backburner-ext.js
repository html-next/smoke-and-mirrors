import Ember from "ember";

const {
  run
  } = Ember;

export default Ember.Object.extend({

  __queue: null,

  debounce: function() {
    var ref = run.debounce.apply(null, arguments);
    this.__queue.addObject(ref);
    return ref;
  },

  throttle: function() {
    var ref = run.throttle.apply(null, arguments);
    this.__queue.addObject(ref);
    return ref;
  },

  schedule: function() {
    var ref = run.schedule.apply(null, arguments);
    this.__queue.addObject(ref);
    return ref;
  },

  scheduleOnce: function() {
    var ref = run.scheduleOnce.apply(null, arguments);
    this.__queue.addObject(ref);
    return ref;
  },

  later: function() {
    var ref = run.later.apply(null, arguments);
    this.__queue.addObject(ref);
    return ref;
  },

  next: function() {
    var ref = run.next.apply(null, arguments);
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

  init: function() {
    this.__queue = Ember.A();
  }

});
