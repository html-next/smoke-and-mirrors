import Ember from "ember";

export default Ember.Controller.extend({

  queryParams: ['numRows'],
  numRows: 100,

  actions: {
    addRow: function() {
      this.incrementProperty('numRows');
    },
    removeRow: function() {
      this.decrementProperty('numRows');
    }
  }

});
