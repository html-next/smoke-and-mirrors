module.exports = {
  description: 'Install ember-run-raf',

  normalizeEntityName: function() {},

  afterInstall: function() {
    this.addAddonToProject('ember-run-raf', '^1.0.5');
    return this.addAddonToProject('ember-async-image', '0.0.1');
  }
};
