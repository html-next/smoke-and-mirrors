/* global module*/
module.exports = {
  normalizeEntityName: function() {},

  afterInstall: function() {
    return this.addBowerPackagesToProject([
      { name: 'animation-frame', target: '~0.2.4' }
    ]);
  }
};
