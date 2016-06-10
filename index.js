// jscs: disable
/* jshint node: true */
'use strict';
var debug = require('debug')('s&m');
var chalk = require('chalk');

function discoverApp(app) {
  var i = 0;

  while (app && !app.import) {
    i++;
    debug(chalk.yellow('Looking for parent app of addon: ['+i+']'));
    app = app.app;
  }

  if (!app || !app.import) {
    debug(chalk.red('No Parent App Found!'));
    throw new Error("Smoke And Mirrors could not find the parent application.");
  }

  return app;
}

module.exports = {
  name: 'smoke-and-mirrors',

  included: function(app) {
    var trueApp = discoverApp(app);

    if (!/production/.test(trueApp.env)) {
      debug(chalk.cyan('Including Vertical-Collection Debug CSS'));
      trueApp.import('./vendor/debug.css');
    }
  },

  isDevelopingAddon: function() {
    return true;
  }

};
