import Ember from "ember";
var indexOf = Ember.EnumerableUtils.indexOf;

export default Ember.Component.extend({

  classNames : ['row', 'selectableOption'],
  classNameBindings : ['selected', 'status'],

  selected : function () {
    var value = this.get('content');
    var selection = this.get('parentView.controlledSelection');

    //App.Logger.debug('selection', selection);
    //App.Logger.debug('value', value);
    if (this.get('parentView.multiple')) {
      //App.Logger.debug('selection is multiple checking index:', indexOf(selection, value));
      return selection && indexOf(selection, value) > -1;
    }

    return value === selection.objectAt(0);

  }.property('value', 'parentView.controlledSelection.@each'),

  layoutName : 'components/selectable-input/option',

  label : function () {

    var labelPath = this.get('parentView.optionLabelPath'),
      secondaryLabelPath = this.get('parentView.optionSecondaryLabelPath');

    if (!labelPath) { return ''; }

    if (secondaryLabelPath) {
      return '<span>' + this.get(labelPath) + '</span><div class="secondaryLabel">' + this.get(secondaryLabelPath) + '</div>';
    } else {
      return this.get(labelPath);
    }

  }.property('parentView.optionLabelPath', 'parentView.optionSecondaryLabelPath', 'content'),

  status : function () {

    var statusPath = this.get('parentView.optionStatusClassPath');

    if (!statusPath) { return ''; }

    return this.get(statusPath);

  }.property('parentView.optionStatusClassPath', 'content'),

  tap : function () {
    if (!this.get('parentView.disabled')) {
      this.triggerAction({
        action : 'select',
        actionContext : this.get('content'),
        target : this.get('parentView'),
        bubbles : false
      });
    }
    return false;

  },

  press : function () {

    if (!this.get('parentView.disabled')) {
      this.triggerAction({
        action : 'select',
        actionContext : this.get('content'),
        target : this.get('parentView'),
        bubbles : false
      });
    }
    return false;

  }

});
