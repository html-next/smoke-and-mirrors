import Ember from "ember";

const {
  assert
} = Ember;

/**!
 * schedule a task to be run during the next animation frame.  This is similar to calling
 * `Ember.run.next`, more similar to `Ember.run.later(context, method, ...params, 1000 / 16)`,
 * but uses `requestAnimationFrame` if available.
 */
export default function scheduleIntoNextAmimationFrame(context, method) {

  var restArgs = Array.prototype.slice.call(arguments, scheduleIntoNextAmimationFrame.length);

  // we should have at least two params
  assert("scheduleIntoNextAnimationFrame expects a minimum of a context and a function as arguments.", arguments.length >= 2);

  // ensure method is a function
  assert("The second param provided to scheduleIntoNextAnimationFrame must be a function.", typeof method === 'function');

  // make requestAnimationFrame support contexts and params
  var frameCallback = function scheduledFrameTask(method, orgRestArgs, granularity) {
    orgRestArgs.unshift(granularity);
    return method.apply(this, orgRestArgs);
  }.bind(context, method, restArgs);

  return window.requestAnimationFrame(frameCallback);

}
