import Ember from 'ember';

export default {
  name: 'request-animation-frame',

  initialize: function() {
    window.AnimationFrame.shim();
  }

}
