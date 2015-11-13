import Ember from 'ember';
import getNumbers from 'dummy/lib/get-numbers';

const {
  Route
  } = Ember;

export default Route.extend({

  model() {
    let pages = [];
    for (let i = 0; i < 100; i++) {
     let data = {
          numbers: getNumbers(0, 20, i + '-'),
          first: 0,
          last: 20
        };
      pages.push(data)
    }
    return {
      pages: pages
    };
  }

});
