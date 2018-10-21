"use strict";

var utils = require("belty");
var types = require("dis-isa");
var ChunkedBundle = require("./chunkedBundle");
var configurator = require("setopt")();
var pluginLoader = require("../pluginLoader");

class Bundler {
  constructor(options) {
    this._prebundle = [];
    this._postbundle = [];

    if (!options.provider) {
      options.provider = new ChunkedBundle(options);
    }

    configurator.configure(this, options);
  }

  configure(options) {
    configurator.configure(this, options);
    return this;
  }

  provider(provider) {
    this._provider = provider;
    return this;
  }

  plugins(plugins) {
    pluginLoader(utils.toArray(plugins)).forEach((plugin) => {
      if (types.isFunction(plugin)) {
        plugin = {
          prebundle: plugin
        };
      }

      configurator.configure(this, plugin);
    });

    return this;
  }

  prebundle(plugins) {
    if (!plugins) {
      throw new TypeError("Must provide plugins to register for prebundle");
    }

    this._prebundle = this._prebundle.concat(utils.toArray(plugins));
    return this;
  }

  postbundle(plugins) {
    if (!plugins) {
      throw new TypeError("Must provide plugins to register for postbundle");
    }

    this._postbundle = this._postbundle.concat(utils.toArray(plugins));
    return this;
  }

  bundle(context) {
    if (!context) {
      throw new TypeError("Must provide bundle context");
    }

    if (!this._provider) {
      throw new TypeError("Bundler does not have a provider configured");
    }

    return [runPlugins(this, this._prebundle), runBundler(this), runPlugins(this, this._postbundle)]
      .reduce((promise, next) => promise.then(next), Promise.resolve(context));
  }
}

function runBundler(bundler) {
  return function bundlerRunner(context) {
    return Promise.resolve(bundler._provider.bundle(context));
  };
}

function runPlugins(bundler, plugins) {
  return function pluginRunner(context) {
    return plugins.reduce((next, plugin) => next.then((context) => plugin(bundler._provider, context)), Promise.resolve(context));
  };
}

module.exports = Bundler;
