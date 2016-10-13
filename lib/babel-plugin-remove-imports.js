var path = require('path');

function removeImports(filteredModules) {
  if (!Array.isArray(filteredModules)) {
    filteredModules = [filteredModules];
  }

  function pluginRemoveImports(babel) {
    var importDeclarationsToRemove;

    return new babel.Transformer('babel-plugin-remove-imports', {
      Program: {
        enter: function() {
          importDeclarationsToRemove = [];
        },
        exit: function() {
          importDeclarationsToRemove.forEach(function(declaration) {
            declaration.dangerouslyRemove();
          });

          importDeclarationsToRemove = undefined;
        }
      },

      ImportDeclaration: function(node) {
        var name = node.source.value;
        if (filteredModules.indexOf(name) !== -1) {
          importDeclarationsToRemove.push(this);
        }
      }
    });
  }

  pluginRemoveImports.baseDir = function() {
    return path.join(__dirname, '../');
  };

  return pluginRemoveImports;
}

module.exports = removeImports;
