var utils = require("belty");
var types = require("dis-isa");
var jsBundler = require("bit-bundler-browserpack");
var configurator = require("setopt")();


function Bundler(options) {
  this._prebundle = [];
  this._postbundle = [];

  if (!options.provider) {
    options.provider = jsBundler(options);
  }

  configurator.configure(this, options);
}


Bundler.prototype.configure = function(options) {
  configurator.configure(this, options);
  return this;
};


Bundler.prototype.provider = function(provider) {
  this._provider = provider;
  return this;
};


Bundler.prototype.plugins = function(plugins) {
  var bundler = this;

  utils.toArray(plugins).forEach(function(plugin) {
    if (types.isFunction(plugin)) {
      plugin = {
        prebundle: plugin
      };
    }

    configurator.configure(bundler, plugin);
  });

  return this;
};


Bundler.prototype.prebundle = function(plugins) {
  if (!plugins) {
    throw new TypeError("Must provide plugins to register for prebundle");
  }

  this._prebundle = this._prebundle.concat(utils.toArray(plugins));
  return this;
};


Bundler.prototype.postbundle = function(plugins) {
  if (!plugins) {
    throw new TypeError("Must provide plugins to register for postbundle");
  }

  this._postbundle = this._postbundle.concat(utils.toArray(plugins));
  return this;
};


Bundler.prototype.bundle = function(context) {
  if (!context) {
    throw new TypeError("Must provide bundle context");
  }

  if (!this._provider) {
    throw new TypeError("Bundler does not have a provider configured");
  }

  return [runPlugins(this, this._prebundle), runBundler(this), runPlugins(this, this._postbundle)]
    .reduce(function(promise, next) {
      return promise.then(next);
    }, Promise.resolve(context));
};


function runBundler(bundler) {
  return function(context) {
    return Promise
      .resolve(bundler._provider.bundle(context))
      .then(function(result) {
        return context.setBundle(result);
      });
  };
}


function runPlugins(bundler, plugins) {
  return function pluginRunner(context) {
    return plugins.reduce(function(next, plugin) {
      return next
        .then(function(context) {
          return plugin(bundler._provider, context);
        })
        .then(function(result) {
          return context.configure(result);
        });
    }, Promise.resolve(context));
  };
}


module.exports = Bundler;
