var Plugin = require("./plugin");
var resolver = require("../src/resolvePath").configure({baseUrl: __filename});
var utils = require("belty");

var defaults = {
  match: {
    name: "@loadstyle-bits",
    path: /[\w]+\.(css)$/
  }
};

function resolveCSS(meta) {
  if (meta.name === defaults.match.name) {
    return resolver({
      name: "loadstyle-bits"
    });
  }
}

function dependencyCSS(meta) {
  if (meta.name !== defaults.match.name) {
    return {
      deps: [defaults.match.name],
      source: "require(\"" + defaults.match.name + "\")({source: " + JSON.stringify(meta.source) + "});"
    };
  }
}

function cssPlugin(options) {
  var plugin = Plugin.create(utils.merge({}, defaults, options));

  return Plugin.configure(plugin, {
    resolve: resolveCSS,
    dependency: dependencyCSS
  });
}

module.exports = cssPlugin;
