//import Ember from 'ember';
import Queue from './queue';

/*
const {
  RSVP
  } = Ember;

const {
  Promise
  } = RSVP;
*/
export default Queue.extend({

  _photos: null,

  process(/*item*/) {

  },

  init() {
    this._super();
    this.set('_photos', {});
  }

});
