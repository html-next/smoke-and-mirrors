import Ember from "ember";

export default Ember.Component.extend({

  tagName : 'side-canvas',
  classNameBindings : ['visible:is-visible'],

  name : 'sidebar',
  viewName : Ember.computed.alias('name'),

  visible : false,

  actions : {
    showHiddenCanvas : function () {
      this.set('visible', true);
    }
  }

});
