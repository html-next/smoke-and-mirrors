import Ember from 'ember';
import getNumbers from 'dummy/lib/get-numbers';

const {
  Route
  } = Ember;

export default Route.extend({

  model() {
    let numbers = getNumbers(0, 50);
    return {
      numbers,
      first: 0,
      last: 50,
      filtered: numbers
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
