import Ember from "ember";

export default Ember.View.extend({

  templateName: 'dbmon-row-cells',
  classNames: ['Query'],
  classNameBindings: ['elapsedClassName'],

  tagName: 'td',

  elapsed: Ember.computed('content.elapsed', function(){
    var elapsed = this.get('content.elapsed');
    return elapsed ? formatElapsed(elapsed) : '';
  }).readOnly(),

  elapsedClassName: Ember.computed('content.elapsed', function(){
    var elapsed = this.get('content.elapsed');
    return elapsedClass(elapsed);
  }).readOnly()

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
