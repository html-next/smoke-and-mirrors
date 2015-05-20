import Ember from "ember";
import getImages from '../lib/get-images';

export default Ember.Controller.extend({

  numImages: 10,

  actions: {
    loadAbove: function() {
      console.log('loadAbove');
      var images = getImages(10);
      var model = this.get('model.images.[]');
      var newModel =  images.concat(model);
      this.set('model.images.[]', newModel);
    },
    loadBelow: function() {
      console.log('loadBelow');
      var images =  getImages(10);
      var model = this.get('model.images.[]');
      var newModel =  model.concat(images);
      this.set('model.images.[]', newModel);
    }
  }

});
