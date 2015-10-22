import Ember from 'ember';
import getImages from 'dummy/lib/get-images';

const {
  Route,
  RSVP
  } = Ember;

export default Route.extend({

  model() {

    let images = getImages(1);

    console.log('images', images);

    return RSVP.hash({
      imageTitle: 'Is this Art?',
      imageSrc: images[0].small,
      imageAlt: 'Artistic License Example',
      imagePlaceholder: ''
    });
  },

  setupController(controller, model) {
    controller.set('attrs', model);
  }

});
