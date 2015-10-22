import Ember from 'ember';
import jQuery from 'jquery';

const {
  Controller
  } = Ember;

export default Controller.extend({

  renderIntoElement: null,
  shouldRenderIntoElement: false,

  lastKnownDimensions: null,

  actions: {
    render() {
      this.setProperties({
        renderIntoElement: null,
        shouldRenderIntoElement: true
      });
    },

    renderInto1() {
      let element = jQuery('#renderIntoMe1').get(0);
      this.setProperties({
        renderIntoElement: element,
        shouldRenderIntoElement: true
      });
    },

    renderInto2() {
      let element = jQuery('#renderIntoMe2').get(0);
      this.setProperties({
        renderIntoElement: element,
        shouldRenderIntoElement: true
      });
    },

    renderFragment() {
      this.toggleProperty('shouldRenderIntoElement');
    },

    displayDimensions(dimensions) {
      this.set('lastKnownDimensions', JSON.stringify(dimensions.calc, null, 2));
    }

  }

});
