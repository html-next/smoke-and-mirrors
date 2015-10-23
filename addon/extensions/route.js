import Ember from 'ember';

const {
  inject,
  Route,
  on,
  } = Ember;

function logMethod(name) {
  return function() {
    let org = this._super(...arguments);
    console.log('Hook: ' + name, arguments);
    debugger;
    return org;
  }
}

export default Route.extend({
  enter: logMethod('enter'),
  exit: logMethod('exit'),
  didTransition: logMethod('didTransition'),
  activate: logMethod('activate')
});
