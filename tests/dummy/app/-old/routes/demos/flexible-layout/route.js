import Ember from 'ember';
import { getDynamicImages } from 'dummy/lib/get-images';

const {
  Route
  } = Ember;

export default Route.extend({

  model() {
    return { images: getDynamicImages(10) };
  }

});
