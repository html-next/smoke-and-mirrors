import Ember from "ember";

export default Ember.View.extend({

  templateName: 'dbmon-row-cells',
  classNames: ['Query', 'elapsed'],
  classNameBindings: ['isShort:short', 'isNormal:warn', 'isLong:warn_long:'],

  tagName: 'td',

  elapsed: Ember.computed('content.elapsed', function(){
    var elapsed = this.get('content.elapsed');
    return elapsed ? formatElapsed(elapsed) : '';
  }).readOnly(),

  isShort: false,
  isLong: false,
  isNormal: false,

  elapsedClassName: Ember.immediateObserver('elapsed', function(){
    var elapsed = this.get('content.elapsed');
    if (elapsed >= 10.0) {
      this.setProperties({
        isShort: false,
        isLong: true,
        isNormal: false
      });
    } else if (elapsed >= 1.0) {
      this.setProperties({
        isShort: false,
        isLong: false,
        isNormal: true
      });
    } else {
      this.setProperties({
        isShort: true,
        isLong: false,
        isNormal: false
      });
    }
    return elapsedClass(elapsed);
  })

});


function elapsedClass(elapsed) {

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
