import Ember from 'ember';

export default function isGlimmer() {
  return (Ember.VERSION.indexOf('2') === 0 || Ember.VERSION.indexOf('1.13') === 0);
}
