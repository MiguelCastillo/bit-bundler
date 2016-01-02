var types = require("dis-isa");
var utils = require("belty");
var configurator = require("./configurator")();


function Bundler(options) {
  this._plugins = [];
  configurator.configure(this, options);
}


Bundler.prototype.configure = function(options) {
  configurator.configure(this, options);
  return this;
};


Bundler.prototype.bundler = function(bundler) {
  this._bundler = bundler;
  return this;
};


Bundler.prototype.plugins = function(plugins) {
  if (!plugins) {
    throw new TypeError("Must provide plugins to register");
  }

  if (!types.isArray(plugins)) {
    plugins = [plugins];
  }

  this._plugins = this._plugins.concat(plugins);
  return this;
};


Bundler.prototype.bundle = function(context) {
  if (!context) {
    throw new TypeError("Must provide bundle context");
  }

  if (!this._bundler) {
    throw new TypeError("Bundler does not have a bundler handler configured");
  }

  return Promise
    .resolve(this._bundler.bundle(context))
    .then(mergeResult(context))
    .then(pluginRunner(this));
};


function pluginRunner(bundler) {
  return function runPlugins(context) {
    var resultMerger = mergeResult(context);

    return bundler._plugins
      .reduce(function(next, plugin) {
        return next.then(function(result) {
          result = resultMerger(result);
          return plugin(bundler._bundler, result) || result;
        });
      }, Promise.resolve(context))
  };
}


function mergeResult(context) {
  return function mergeResultDelegate(result) {
    if (result && result !== context) {
      context = utils.merge({}, context, result);
    }

    return context;
  };
}


module.exports = Bundler;
