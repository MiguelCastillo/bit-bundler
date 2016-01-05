var plugin = require("bit-bundler-utils/plugin");
var utils = require("belty");

// For now we will use the full path as the name while this
// issue is resolved:
// https://github.com/MiguelCastillo/bit-loader/issues/187
var loadStyleName = __dirname + "/loadstyle.js";

var defaults = {
  match: {
    path: /[\w]+\.(css)$/
  }
};

function dependencyCSS(meta) {
  return {
    deps: [loadStyleName],
    source: "require(\"" + loadStyleName + "\")(" + JSON.stringify(meta.source) + ");"
  };
}

function cssPlugin(options) {
  var _plugin = plugin.create(utils.merge({}, defaults, options));

  return plugin.configure(_plugin, {
    dependency: dependencyCSS
  });
}

module.exports = cssPlugin;
