import Ember from "ember";

/*
 This is nasty, be careful
 */
export default function () {
  var deferred = Ember.RSVP.defer(),
    promise = new Ember.RSVP.Promise(function(resolve, reject) {
      deferred.promise.then(
        function () { promise.__state = "resolved"; resolve.apply(this, arguments); },
        function () { promise.__state = "rejected"; reject.apply(this, arguments); }
      );
    });

  promise.__state = "pending";
  promise.resolve = deferred.resolve.bind(deferred);
  promise.reject = deferred.reject.bind(deferred);

  return promise;

}
