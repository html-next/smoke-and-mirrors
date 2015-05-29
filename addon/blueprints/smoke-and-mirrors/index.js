/* global module*/
module.exports = {
  normalizeEntityName: function() {},

  afterInstall: function() {
    this.addBowerPackagesToProject([
      { name: 'animation-frame', target: '~0.2.4' }
    ]);
  }
};
