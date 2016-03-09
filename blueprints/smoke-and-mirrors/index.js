var RSVP = require('rsvp');

module.exports = {
  description: 'Install ember-run-raf',

  normalizeEntityName: function() {},

  afterInstall: function() {
    return RSVP.all([
      this.addAddonToProject('ember-run-raf', '^1.1.0'),
      this.addAddonToProject('ember-async-image', '^0.1.1')
      ]);
  }
};
