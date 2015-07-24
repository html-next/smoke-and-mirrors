import Ember from 'ember';
import config from '../config/environment';

export default Ember.Controller.extend({
  version: config.VERSION,
  emberVersion: Ember.VERSION
});
