/* jshint node: true */
'use strict';

module.exports = {
  name: 'smoke-and-mirrors',

  included : function (app) {
    app.import(app.bowerDirectory + '/animation-frame/AnimationFrame.min.js');
  },

  isDevelopingAddon: function() {
    return true;
  }

};
