import Ember from 'ember';

const {
  computed
  } = Ember;

export default Ember.Component.extend({

  tagName: 'tr',

  queries: computed('attrs.db', function() {
    console.log('queries');
    return this.get('db.queries');
  }),

  topFiveQueries: computed('queries', function() {
    console.log('topFiveQueries');
    let queries = this.get('queries');
    let topFiveQueries = queries.slice(0, 5);

    while (topFiveQueries.length < 5) {
      topFiveQueries.push({ query: "" });
    }

    return topFiveQueries.map(function(query, index) {
      return {
        key: index+'',
        query: query.query,
        elapsed: query.elapsed ? formatElapsed(query.elapsed) : '',
        className: elapsedClass(query.elapsed)
      };
    });

  }),

  countClassName: computed('queries', function() {
    let queries = this.get('queries');
    let countClassName = "label";

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


function elapsedClass(elapsed) {
  if (elapsed >= 10.0) {
    return "elapsed warn_long";
  } else if (elapsed >= 1.0) {
    return "elapsed warn";
  } else {
    return "elapsed short";
  }
}

var _base = String.prototype;

_base.lpad = _base.lpad || function(padding, toLength) {
  return padding.repeat((toLength - this.length) / padding.length).concat(this);
};

function formatElapsed(value) {
  var str = parseFloat(value).toFixed(2);
  if (value > 60) {
    var minutes = Math.floor(value / 60);
    var comps = (value % 60).toFixed(2).split('.');
    var seconds = comps[0].lpad('0', 2);
    var ms = comps[1];
    str = minutes + ":" + seconds + "." + ms;
  }
  return str;
}
