// jscs: disable
/* jshint node: true */
'use strict';

var chalk = require('chalk');

module.exports = {
  name: 'smoke-and-mirrors',

  included: function(app) {
    if (!/production/.test(app.env)) {
      console.info(
        chalk.grey("\n===================================================================\n") +
        chalk.cyan("\tSmoke-and-mirrors\n") +
        chalk.grey("\t:: Including CSS for Visual Debugger\n") +
        chalk.grey("\t:: (included in non production builds only)\n") +
        chalk.grey("\t:: To use, set ") + chalk.yellow("{{vertical-collection debug=true}}") +
        chalk.grey("\n===================================================================\n")
      );
      app.import('./vendor/debug.css');
    }
  },

  isDevelopingAddon: function() {
    return false;
  }

};
