module.exports = {
  description: 'Install ember-run-raf',

  normalizeEntityName: function() {},

  afterInstall: function() {
    return this.addAddonToProject('ember-run-raf', '^1.1.0');
  }
};
