import Ember from 'ember';
import getNumbers from 'dummy/lib/get-numbers';

const {
  Controller
  } = Ember;

export default Controller.extend({

  numImages: 5,

  actions: {

    loadAbove() {
      // console.info('LOAD ABOVE: ' + (new Date()).getTime());
      let first = this.get('model.first');
      let numbers = getNumbers(first - 20, 20);
      let model = this.get('model.numbers');
      let newModel =  numbers.concat(model);
      this.set('model.numbers', newModel);
      this.set('model.first', first - 20);
    },

    loadBelow() {
      // console.info('LOAD BELOW: ' + (new Date()).getTime());
      let last = this.get('model.last');
      let numbers = getNumbers(last, 20);
      let model = this.get('model.numbers');
      let newModel =  model.concat(numbers);
      this.set('model.numbers', newModel);
      this.set('model.last', last + 20);
    }

  }

});
