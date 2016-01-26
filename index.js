// jscs: disable
/* jshint node: true */

'use strict';

module.exports = {
  name: 'smoke-and-mirrors',

  included: function(app) {
    if (!/production/.test(app.env)) {
      console.info('Smoke-and-mirrors:: Including Vertical-Collection Debug CSS');
      app.import('./vendor/debug.css');
    }
  },

  isDevelopingAddon: function() {
    return false;
  }

};
