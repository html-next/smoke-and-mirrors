/* jshint node: true */
'use strict';

module.exports = {
  name: 'smoke-and-mirrors',

  included : function (app) {
    if (!/production/.test(app.env)) {
      console.info('Including Debugging Visualization');
      app.import('./vendor/debug.css');
    }
  },

  isDevelopingAddon: function() {
    return true;
  }

};
