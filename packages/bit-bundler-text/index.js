var Plugin = require("bit-bundler-utils/plugin");
var utils = require("belty");

var defaults = {};

function dependencyText(meta) {
  return {
    source: "module.exports = " + JSON.stringify(meta.source) + ";"
  };
}

function textPlugin(options) {
  var plugin = Plugin.create(utils.merge({}, defaults, options));

  return Plugin.configure(plugin, {
    dependency: dependencyText
  });
}

module.exports = textPlugin;
