import Ember from "ember";

export default Ember.Component.extend({

  tagName : 'li',
  classNames : ['autocompleteTag', 'selectableTag'],
  classNameBindings : ['status'],
  layoutName : 'resources/components/autocomplete-input/tag',

  label : function () {

    var labelPath = this.get('parentView.optionLabelPath');

    if (!labelPath) { return ''; }
    return this.get(labelPath);

  }.property('parentView.optionLabelPath', 'content'),

  status : function () {

    var statusPath = this.get('parentView.optionStatusClassPath');

    if (!statusPath) { return ''; }
    return this.get(statusPath);

  }.property('parentView.optionStatusClassPath', 'content'),

  actions : {
    removeTag : function () {
      this.triggerAction({
        action : 'select',
        actionContext : this.get('content'),
        target : this.get('parentView'),
        bubbles : false
      });
      return false;
    }
  }

});
