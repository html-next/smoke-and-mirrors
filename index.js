/* jshint node: true */
'use strict';

module.exports = {
  name: 'smoke-and-mirrors',

  included : function (app) {
    app.import(app.bowerDirectory + '/animation-frame/AnimationFrame.min.js');

    if (!/production/.test(app.env)) {
      app.import('./vendor/debug.css');
    }
  },

  isDevelopingAddon: function() {
    return false;
  }

};
