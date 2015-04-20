import Ember from "ember";
import transition from "../../transition";
import updateTransitionMap from "../../transition-map";

export default Ember.Component.extend({

  tagName : 'off-canvas',

  classNameBindings : ['activated:is-activated'],
  activated : false,

  _activeView : null,

  transitionMap : null,

  sections : function () {
    var sections = {};
    var childViews = this.get('childViews');
    var Map = this.get('transitionMap');

    childViews.forEach(function(item){
      sections[item.get('viewName')] = item;
    });

    updateTransitionMap(Map, Sections);
    return sections;

  }.property('childViews.@each'),

  actions : {

    toggleCanvas : function (name) {

      Ember.assert('off-canvas::toggleCanvas must be passed the name of a canvas to activate', name);

      var oldCanvas = this.get('_activeView') || this.get('sections.main');
      var newCanvas = this.get('sections.' + name);

      if (oldCanvas === newCanvas) { return; }

      transition(this.get('transitionMap'), oldCanvas, newCanvas);
      this.set('_activeView', newCanvas);

    }
  }

});
