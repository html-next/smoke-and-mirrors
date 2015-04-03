import Ebmer from "ember";
import getImages from '../../lib/get-images';

export default Ember.Controller.extend({

  numImages: 10,

  actions: {
    loadAbove: function() {
      var images =  getImages(10);
      var model = this.get('model');
      this.set('model', images.concat(model));
    },
    loadBelow: function() {
      var images =  getImages(10);
      var model = this.get('model');
      this.set('model', model.concat(images));
    }
  }

});
