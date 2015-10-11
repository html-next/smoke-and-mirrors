import Ember from 'ember';
import getImages from 'dummy/lib/get-images';

const {
  Route
  } = Ember;

export default Route.extend({

  model() {
    return { images: getImages(50) };
  }

});
