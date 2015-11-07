import Ember from 'ember';
import { getDynamicImages } from 'dummy/lib/get-images';

const {
  Route
  } = Ember;

export default Route.extend({

  model() {
    let pages = [];
    for (let i = 0; i < 100; i++) {
      pages.push(getDynamicImages(20))
    }
    return {
      pages: pages
    };
  }

});
