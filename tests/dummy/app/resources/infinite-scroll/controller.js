import Ebmer from "ember";
import getImages from '../../lib/get-images';

export default Ember.Controller.extend({

  numImages: 10,

  actions: {
    loadAbove: function() {
      console.log('loadAbove', arguments);
      var images =  getImages(10);
      var model = this.get('model.images');
      var newModel =  images.concat(model);
      console.log('newModel', newModel);
      this.set('model.images.[]', newModel);
    },
    loadBelow: function() {
      console.log('loadBelow', arguments);
      var images =  getImages(10);
      var model = this.get('model.images');
      var newModel =  model.concat(images);
      console.log('newMode', newModel);
      this.set('model.images.[]', newModel);
    }
  }

});
