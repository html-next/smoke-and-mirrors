import Ember from 'ember';
import getImages from 'dummy/lib/get-images';

const {
  Controller
  } = Ember;

export default Controller.extend({

  numImages: 5,

  actions: {

    loadAbove() {
      // console.info('LOAD ABOVE: ' + (new Date()).getTime());
      let images = getImages(5);
      let model = this.get('model.images');
      let newModel =  images.concat(model);
      this.set('model.images', newModel);
    },

    loadBelow() {
      // console.info('LOAD BELOW: ' + (new Date()).getTime());
      let images =  getImages(5);
      let model = this.get('model.images');
      let newModel =  model.concat(images);
      this.set('model.images', newModel);
    }

  }

});
