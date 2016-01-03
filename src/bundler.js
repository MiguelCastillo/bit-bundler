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
    .then(setBundle(context))
    .then(runPlugins(this));
};


function runPlugins(bundler) {
  return function pluginRunner(context) {
    return bundler._plugins
      .reduce(function(next, plugin) {
        return next.then(function(result) {
          result = context.configure(result);
          return plugin(bundler._bundler, result) || result;
        });
      }, Promise.resolve(context))
  };
}


function setBundle(context) {
  return function setBundleDelegate(bundle) {
    return context.setBundle(bundle);
  };
}


module.exports = Bundler;
