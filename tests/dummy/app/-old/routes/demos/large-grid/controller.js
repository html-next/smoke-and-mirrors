import Ember from 'ember';

const {
  Controller
  } = Ember;

export default Controller.extend({

  usePages: true,

  actions: {

    toggleStrategy() {
      this.toggleProperty('usePages');
    }

  }

});
