/* global require, module */
var EmberApp = require('ember-cli/lib/broccoli/ember-addon');
var jsStringEscape = require('js-string-escape');

// Qunit test generator
function eslintTestGenerator(relativePath, errors) {
  var pass = !errors || errors.length === 0;
  return "import { module, test } from 'qunit';\n" +
    "module('ESLint - " + path.dirname(relativePath) + "');\n" +
    "test('" + relativePath + " should pass ESLint', function(assert) {\n" +
    "  assert.ok(" + pass + ", '" + relativePath + " should pass ESLint." +
    jsStringEscape("\n" + render(errors)) + "');\n" +
    "});\n";
}

function render(errors) {
  if (!errors) { return ''; }
  return errors.map(function(error) {
    return error.line + ':' + error.column + ' ' +
      ' - ' + error.message + ' (' + error.ruleId +')';
  }).join('\n');
}

module.exports = function(defaults) {

  defaults.snippetSearchPaths = ['tests/dummy/app'];
  defaults.snippetPaths = ['tests/dummy/snippets'];

  var app = new EmberApp(defaults, {
    babel: {
      includePolyfill: true
    },
    hinting: false,
    eslint: {
      testGenerator: eslintTestGenerator
    }
  });

  var bootstrapPath = app.bowerDirectory + '/bootstrap/dist/';
  app.import(bootstrapPath + 'css/bootstrap.css');
  app.import(bootstrapPath + 'fonts/glyphicons-halflings-regular.eot', { destDir: '/fonts' });
  app.import(bootstrapPath + 'fonts/glyphicons-halflings-regular.svg', { destDir: '/fonts' });
  app.import(bootstrapPath + 'fonts/glyphicons-halflings-regular.ttf', { destDir: '/fonts' });
  app.import(bootstrapPath + 'fonts/glyphicons-halflings-regular.woff', { destDir: '/fonts' });
  app.import(bootstrapPath + 'fonts/glyphicons-halflings-regular.woff2', { destDir: '/fonts' });

  /*
    This build file specifes the options for the dummy test app of this
    addon, located in `/tests/dummy`
    This build file does *not* influence how the addon or the app using it
    behave. You most likely want to be modifying `./index.js` or app's build file
  */

  return app.toTree();
};
