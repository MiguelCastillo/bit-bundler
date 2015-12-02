var types = require("dis-isa");
var utils = require("belty");
var builtins = require("../plugins/builtins");
var browserPackBundler = require("../bundlers/browserPack");
var pluginCounter = 1;


function Bundler(loader, options) {
  this._loader = loader;
  this._files = [];
  this._options = {};
  this._bundle = browserPackBundler;
  this.configure(options);

  if (options.builtins !== false) {
    this.plugins(builtins());
  }
}


Bundler.prototype.configure = function(options) {
  var bundler = this;

  Object.keys(options)
    .filter(function(option) {
      return types.isFunction(bundler[option]);
    })
    .forEach(function(option) {
      bundler[option](options[option]);
    });

  this._options = utils.merge({}, this._options, options);
  return this;
};


Bundler.prototype.files = function(files) {
  if (!files) {
    throw new TypeError("Files is a required argument");
  }

  if (types.isString(files)) {
    files = [files];
  }

  this._files = this._files.concat(files);
  return this;
};


Bundler.prototype.ignore = function(config) {
  this._loader.ignore(config);
  return this;
};


Bundler.prototype.plugins = function(plugins) {
  var bundler = this;

  if (!types.isArray(plugins)) {
    plugins = [plugins];
  }

  plugins
    .map(configurePlugin)
    .forEach(function(plugin) {
      bundler._loader.plugin(plugin.name, plugin.settings);
    });

  return this;
};


Bundler.prototype.bundle = function(files) {
  files = files || this._files;

  if (!files) {
    throw new TypeError("Must provide Files to bundle");
  }

  return this._loader.fetch(files).then(runBundler(this));
};


function configurePlugin(options) {
  var name = options.name || "bundler-plugin-" + pluginCounter++;
  var settings = utils.extend({}, options);
  delete settings.name;

  return {
    name: name,
    settings: settings
  };
}


function runBundler(bundler) {
  return function runBundlerDelegate(modules) {
    var bundle = bundler._options.bundle ? bundler._options.bundle : bundler._bundle;
    return Promise.resolve(bundle(bundler, modules));
  };
}


module.exports = Bundler;
