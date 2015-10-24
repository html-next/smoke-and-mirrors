import Ember from 'ember';

const {
  Mixin
  } = Ember;

/**!
 * Use this Mixin with a component
 * within an #each loop to give the component
 * `next` and `prev` methods
 */
export default Mixin.create({

  next() {
    let element = this.element.nextElementSibling;
    return element ? this.registry[element.id] : null;
  },

  prev() {
    let element = this.element.previousElementSibling;
    return element ? this.registry[element.id] : null;
  },

  init() {
    this._super(...arguments);
    this.registry = this.container.lookup('-view-registry:main') || Ember.View.views;
  }

});
