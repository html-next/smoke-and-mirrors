import Ember from 'ember';
import getImages from 'dummy/lib/get-images';

const {
  Controller,
  Logger
  } = Ember;

export default Controller.extend({

  numImages: 10,

  actions: {

    loadAbove() {
      let images = getImages(10);
      let model = this.get('model.images');
      let newModel =  images.concat(model);
      this.set('model.images', newModel);
    },

    loadBelow() {
      let images =  getImages(10);
      let model = this.get('model.images');
      let newModel =  model.concat(images);
      this.set('model.images', newModel);
    }

  }

});
