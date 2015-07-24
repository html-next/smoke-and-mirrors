import Ember from "ember";

export default Ember.Controller.extend({

  queryParams: ['numRows', 'timeout'],
  numRows: 100,
  timeout: 0,

  actions: {

    addRow: function() {
      this.incrementProperty('numRows');
    },
    removeRow: function() {
      this.decrementProperty('numRows');
    }
  }

});
