import Ember from "ember";

const N = 100;

var grid = [];
for (var i=0; i < N; i++) {
  var A = [];
  for (var j = 0; j < 20; j++) {
    A.push(j);
  }
  grid.push(A);
}

export default Ember.Route.extend({

  model: function() {
    return grid;
  }

});
