import Ember from "ember";

export default Ember.Controller.extend({

  queryParams: ['numRows', 'timeout'],
  numRows: 100,
  timeout: 500,
  timeoutObserver: Ember.observer('timeout', function() {
    this.send('adjustTimeout', this.get('timeout'));
  }),

  actions: {

    addRow: function() {
      this.incrementProperty('numRows');
    },
    removeRow: function() {
      this.decrementProperty('numRows');
    }
  }

});
