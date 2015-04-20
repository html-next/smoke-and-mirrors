import Ember from "ember";

export default Ember.Component.extend({

  viewName : 'main',

  tagName : 'main-canvas',
  classNameBindings : ['deactivated:deactivated'],

  deactivated : false,

  canvas : Ember.computed.alias('parentView'),

  actions : {

    toggleOffCanvas : function (name) {
      this.get('canvas').send('toggleOffCanvas', name);
      return false;
    }

  }

});
