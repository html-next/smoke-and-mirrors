import Ember from 'ember';
import getNumbers from 'dummy/lib/get-numbers';

const {
  Route
  } = Ember;

export default Route.extend({

  model() {
    let pages = [];
    for (let i = 0; i < 50; i++) {
      const data = {
        numbers: getNumbers(0, 50, `${i}-`),
        first: 0,
        last: 40
      };
      pages.push(data);
    }
    return {
      pages
    };
  }

});
