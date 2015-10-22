/*global module, require*/

module.exports = function (grunt) {

  // show elapsed time at the end
  require('time-grunt')(grunt);

  // load all grunt tasks (currently doesn't work for bump-commit)
  require('jit-grunt')(grunt);

  grunt.initConfig({

    config : {},

    pkg : grunt.file.readJSON("package.json"),

    bump: {
      options: {
        files: ['package.json', 'tests/dummy/config/environment.js'],
        updateConfigs: ['pkg'],
        commit: true,
        commitMessage: 'Release version %VERSION%',
        commitFiles: ['package.json', 'tests/dummy/config/environment.js'],
        createTag: true,
        tagName: '%VERSION%',
        tagMessage: 'Version %VERSION%',
        push: true,
        pushTo: 'upstream',
        gitDescribeOptions: '--tags --always --abbrev=1 --dirty=-d'
      }
    }

  });

  /*
   Generate a Release (also creates a build);
   */
  grunt.registerTask(
    'release',
    'Creates and Publishes a Versioned Release. First arg is target, second arg allows for specific environment.',
    function (target) {

      grunt.loadNpmTasks('grunt-bump');
      var shouldBump = !!target;

      if (!shouldBump) {
        grunt.log.warn('[WARNING] grunt:release – No arguments provided. Version will not be bumped.');
      }

      if (shouldBump && !~['patch', 'major', 'minor', 'prerelease', 'git'].indexOf(target)) {
        grunt.log.error('[ERROR] grunt:release – "' + target + '" is not a valid semver target for to bump.');
        return false;
      }

      if (shouldBump) {
        grunt.task.run(['bump-only:' + target]);
      }

      grunt.task.run([
        'bump-commit'
      ]);

    }
  );

};
