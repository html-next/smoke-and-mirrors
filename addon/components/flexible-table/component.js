import Ember from "ember";
import capitalizeWord from "ember-allpurpose/string/cap-first-letter";

function getDataForKeys(obj, keys) {
  var i;
  var filtered = [];
  for (i in keys) {
    if (keys.hasOwnProperty(i)) {
      filtered.push(obj[i] ||'');
    }
  }
  return filtered;
}

export default Ember.Component.extend({

  headers : null,

  tagName : 'flexible-table',

  _headers : function () {

    //use defined headers if available
    var headers = this.get('headers');
    if (headers) { return headers; }

    //calculate from first row of data
    headers = [];
    var data = this.get('data');
    if (data && data[0]) {
      for (var i in data[0]) {
        if (data[0].hasOwnProperty(i)) {
          headers.push(capitalizeWord(i));
        }
      }
    }

    return headers;

  }.property('headers', 'data'),

  data : null,

  _data : function () {

    var headers = this.get('_headers');
    var data = this.get('data');

    var filteredData = [], i;

    for (i = 0; i < data.length; i++) {
      filteredData.push(getDataForKeys(data[i], headers));
    }

  }.property('_headers', 'data')

});
