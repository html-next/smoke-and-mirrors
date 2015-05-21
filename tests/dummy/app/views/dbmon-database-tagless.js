import Ember from 'ember';

const {
  computed
  } = Ember;

export default Ember.View.extend({

  tagName: '',

  templateName: 'dbmon-database',

  topFiveQueries: computed('content.queries', function() {

    var queries = this.get('content.queries');
    var topFiveQueries = queries.slice(0, 5);

    while (topFiveQueries.length < 5) {
      topFiveQueries.push({ query: "" });
    }

    return topFiveQueries;
  }),

  countClassName: computed('content.queries', function() {
    var queries = this.get('content.queries');

    var countClassName = "label";

    if (queries.length >= 20) {
      countClassName += " label-important";
    } else if (queries.length >= 10) {
      countClassName += " label-warning";
    } else {
      countClassName += " label-success";
    }

    return countClassName;
  })

});
