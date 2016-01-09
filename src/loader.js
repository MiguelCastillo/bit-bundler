var Bitloader = require("bit-loader");
var types = require("dis-isa");
var utils = require("belty");
var configurator = require("./configurator")();
var fileReader = require("./fileReader");
var logger = require("loggero").create("bundler/bundler-index");
var loggerLevel = require("loggero/src/levels");
var resolvePath = require("bit-bundler-utils/resolvePath");
var pluginCounter = 1;


function Loader(options) {
  this._loader = new Bitloader({
    resolve: configureResolve(options),
    fetch: configureFetch(options)
  });

  configurator.configure(this, options);
}


Loader.prototype.configure = function(options) {
  configurator.configure(this, options);
  return this;
};


Loader.prototype.log = function(level) {
  if (level === true) {
    level = "info";
  }

  if (level) {
    Bitloader.logger.enableAll();
    Bitloader.logger.level(loggerLevel[level]);
  }
  else {
    Bitloader.logger.disable();
  }

  return this;
};


Loader.prototype.getModule = function(id) {
  return this._loader.getModule(id);
};


Loader.prototype.fetch = function(files) {
  return this._loader.fetch(files);
};


Loader.prototype.ignore = function(ignore) {
  this._loader.ignore(ignore);
  return this;
};


Loader.prototype.plugins = function(plugins) {
  var loader = this;

  if (!types.isArray(plugins)) {
    plugins = [plugins];
  }

  plugins
    .map(configurePlugin)
    .forEach(function(plugin) {
      loader._loader.plugin(plugin.name, plugin.settings);
    });

  return loader;
};


function configureResolve(options) {
  var resolver = resolvePath.configure({baseUrl: options.baseUrl});

  return function resolveName(meta) {
    return resolver(meta).then(function(result) {
      if (!result) {
        if (options.ignoreNotFound) {
          return {
            path: null
          };
        }
        else {
          logger.error("Cannot find module " + meta.name);
          throw new Error("Cannot find module " + meta.name);
        }
      }

      return result;
    });
  };
}


function configureFetch(options) {
  return function fetchModule(meta) {
    if (!meta.path && options.ignoreNotFound) {
      return {
        source: ""
      };
    }

    return fileReader(meta);
  };
}


function configurePlugin(options) {
  var name = options.name || "bundler-plugin-" + pluginCounter++;
  var settings = utils.extend({}, options);
  delete settings.name;

  return {
    name: name,
    settings: settings
  };
}


module.exports = Loader;
