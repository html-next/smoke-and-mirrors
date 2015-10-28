import Ember from 'ember';
import config from 'dummy/config/environment';

const {
  Controller
  } = Ember;

export default Controller.extend({
  version: config.VERSION,
  emberVersion: Ember.VERSION
});
