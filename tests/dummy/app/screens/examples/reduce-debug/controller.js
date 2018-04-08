import Ember from 'ember';

const {
  Controller
} = Ember;

export default Controller.extend({
  numImages: 50,
  isFiltered: false,

  actions: {
    filter() {
      let model = this.get('model.numbers');
      let isFiltered = this.toggleProperty('isFiltered');

      if (!isFiltered) {
        this.set('model.filtered', model);
      } else {
        let filtered = model.filter(function(item) {
          return item.number < 25;
        });
        this.set('model.filtered', filtered);
      }
    }
  }
});
