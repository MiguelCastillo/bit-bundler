var Plugin = require("bit-bundler-utils/plugin");
var utils = require("belty");
var umd_deps = require("deps-bits");

var defaults = {
  match: {
    path: /[\w]+\.(js)$/
  }
};

function dependencyJavaScript(meta, options) {
  return umd_deps(meta, options);
}

function jsPlugin(options) {
  var plugin = Plugin.create(utils.merge({}, defaults, options));

  return Plugin.configure(plugin, {
    dependency: dependencyJavaScript
  });
}

module.exports = jsPlugin;
