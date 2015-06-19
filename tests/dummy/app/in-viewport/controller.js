import Ember from "ember";

const {
  computed
  } = Ember;

const ROWS_PER_ZONE = 8;

export default Ember.Controller.extend({

  pages: computed('model', function() {
    var rows = this.get('model');
    var pages = [];
    var length = rows.length;
    var j = 0;
    var page = [];
    for (var i = 0; i < length; i++, j++) {
      if (j === ROWS_PER_ZONE) {
        pages.push(page);
        j = 0;
        page = [];
      }
      page.push(rows[i]);
    }
    return pages;
  })

});
