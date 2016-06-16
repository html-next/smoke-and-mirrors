import Ember from 'ember';
import getImages from 'dummy/lib/get-images';

const {
  Route,
  RSVP
  } = Ember;

export default Route.extend({

  model() {
    return RSVP.hash({
      images: getImages(200)
    });
  },

  setupController(controller, model) {
    controller.set('attrs', model);
  }

});
