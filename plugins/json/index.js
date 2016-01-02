var plugin = require("bit-bundler-utils/plugin");
var utils = require("belty");

var defaults = {
  match: {
    path: /[\w]+\.(json)$/
  }
};

function dependencyText(meta) {
  return {
    source: "module.exports = " + meta.source + ";"
  };
}

function textPlugin(options) {
  var _plugin = plugin.create(utils.merge({}, defaults, options));

  return plugin.configure(_plugin, {
    dependency: dependencyText
  });
}

module.exports = textPlugin;
