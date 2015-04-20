import Ember from "ember";

export default Ember.Component.extend({

  tagName : 'flexible-list',

  data : null,

  _list : function () {

    var data = this.get('data'),
      prepared = [];

    if (data) {
      for (var i in data) {
        if (data.hasOwnProperty(i)) {

          //ignore false-ish values
          if (data[i]) {
            prepared.push({
              label : i,
              value : data[i]
            });
          }

        }
      }
    }

    return prepared;

  }.property('data', 'data.@each')

});
