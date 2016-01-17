var types = require("dis-isa");
var jsBundler = require("bit-bundler-browserpack");
var configurator = require("./configurator")();


function Bundler(options) {
  this._plugins = [];

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

  if (!this._provider) {
    throw new TypeError("Bundler does not have a provider configured");
  }

  //
  // Run bundler first.  Not quite sure this is the best way to handle
  // the flow of building bundles.
  // return Promise
  //   .resolve(this._provider.bundle(context))
  //   .then(setBundle(context))
  //   .then(runPlugins(this));
  //

  //
  // Evaluate whether executing the plugins first is more efficient
  // or desirable than building the main bundle and then forcing
  // each and every plugin that splits the main bundle to rebundle
  // the main bundle...  I currently can't see why we wouldn't want
  // to run the plugins first, we are going this route for now.
  //
  var bundler = this;
  return runPlugins(this)(context)
    .then(function(context) {
      return Promise
        .resolve(bundler._provider.bundle(context))
        .then(function(result) {
          return context.setBundle(result);
        });
    });
};


function runPlugins(bundler) {
  return function pluginRunner(context) {
    return bundler._plugins
      .reduce(function(next, plugin) {
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
