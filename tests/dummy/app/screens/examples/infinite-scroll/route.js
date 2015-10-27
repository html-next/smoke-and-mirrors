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
  }

});
