import Ember from 'ember';
import getNumbers from 'dummy/lib/get-numbers';

const {
  Route
  } = Ember;

export default Route.extend({

  model() {
    return {
      numbers: getNumbers(0, 20),
      first: 0,
      last: 20
    };
  },

  actions: {
    willTransition() {
      this.set('controller.model.numbers', null);
      this.controller.set('model', null);
      this.set('currentModel', null);
    }
  }

});
