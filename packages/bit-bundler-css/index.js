var plugin = require("bit-bundler-utils/plugin");
var resolver = require("bit-bundler-utils/resolvePath").configure({baseUrl: __filename});
var utils = require("belty");
var loadStyleName = "bit-bundler-css/loadstyle";

var defaults = {
  match: {
    path: /[\w]+\.(css)$/
  }
};

function dependencyCSS(meta) {
  return {
    deps: [loadStyleName],
    source: "require(\"" + loadStyleName + "\")({source: " + JSON.stringify(meta.source) + "});"
  };
}

function cssPlugin(options) {
  var _plugin = plugin.create(utils.merge({}, defaults, options));

  return plugin.configure(_plugin, {
    dependency: dependencyCSS
  });
}

module.exports = cssPlugin;
