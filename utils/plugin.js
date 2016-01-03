var utils = require("belty");
var types = require("dis-isa");


var defaults = {
  resolve: [],
  fetch: [],
  transform: [],
  dependency: []
};


function Plugin(options) {
  var plugin = utils.extend({}, defaults);
  return Plugin.configure(plugin, options);
}


Plugin.create = function(options) {
  return Plugin(options);
}


Plugin.configure = function(plugin, options) {
  options = options || {};

  Object.keys(options)
    .filter(function(option) {
      return defaults.hasOwnProperty(option);
    })
    .map(function(option) {
      var value = options[option];
      return {
        name: option,
        value: types.isArray(value) ? value : [value]
      }
    })
    .forEach(function(config) {
      plugin[config.name] = plugin[config.name].concat(config.value);
    });

  if (options.match) {
    plugin.match = utils.merge({}, plugin.match, options.match);
  }

  if (options.ignore) {
    plugin.ignore = utils.merge({}, plugin.ignore, options.ignore);
  }

  return plugin;
};


module.exports = Plugin;
