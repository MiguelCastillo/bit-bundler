var Bitloader = require("bit-loader");
var types = require("dis-isa");
var utils = require("belty");
var configurator = require("./configurator")();
var logger = require("loggero").create("bundler/loader");
var loggerLevel = require("loggero/src/levels");
var resolvePath = require("bit-bundler-utils/resolvePath");
var readFile = require("bit-bundler-utils/readFile");
var pluginCounter = 1;


function Loader(options) {
  this._provider = new Bitloader({
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
  return this._provider.getModule(id);
};


Loader.prototype.fetch = function(files) {
  return this._provider.fetch(files);
};


Loader.prototype.ignore = function(ignore) {
  this._provider.ignore(ignore);
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
      loader._provider.plugin(plugin.name, plugin.settings);
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
            path: ""
          };
        }
        else {
          var error = buildModuleNotFoundError(meta);
          logger.error(error);
          throw new Error(error);
        }
      }

      return result;
    });
  };
}


function configureFetch(options) {
  return function fetchModule(meta) {
    function handleError(err) {
      if (options.ignoreNotFound) {
        return {
          source: ""
        };
      }
      else {
          var error = buildModuleNotFoundError(meta, err);
          logger.error(error);
          throw new Error(error);
      }
    }

    return readFile(meta).then(utils.noop, handleError);
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


function buildModuleNotFoundError(meta, err) {
  var error = "Unable find module \"" + meta.name + "\".";
  error += meta.referrer ? " Referrer " + JSON.stringify(meta.referrer.path) : "";
  error += err ? "\n" + err : "";
  return error;
}


module.exports = Loader;
