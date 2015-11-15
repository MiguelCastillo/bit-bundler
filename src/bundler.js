var browserPack = require("browser-pack");
var pstream     = require("p-stream");
var types       = require("dis-isa");


function Bundler(loader, options) {
  this._loader = loader;
  this._options = options;
  this._files = [];

  if (options.files) {
    this.files(options.files);
  }

  if (options.ignore) {
    this.ignore(options.ignore);
  }
}


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


Bundler.prototype.processor = function(config) {
  this._loader.plugin("bundler", {
    transform: config
  });

  return this;
};


Bundler.prototype.resolve = function(config) {
  this._loader.plugin("bundler", {
    resolve: config
  });

  return this;
};


Bundler.prototype.fetch = function(config) {
  this._loader.plugin("bundler", {
    fetch: config
  });

  return this;
};


Bundler.prototype.transform = function(config) {
  this._loader.plugin("bundler", {
    transform: config
  });

  return this;
};


Bundler.prototype.dependency = function(config) {
  this._loader.plugin("bundler", {
    dependency: config
  });

  return this;
};


/**
 * Bundles up incoming modules. This will process all dependencies and will create
 * a bundle using browser-pack.
 *
 * @returns {Promise} When resolve, the full bundle buffer is returned
 */
Bundler.prototype.bundle = function(settings, success, failure) {
  if (types.isFunction(settings)) {
    success  = settings;
    failure  = success;
    settings = {};
  }

  success = success || function() {};

  var bundler = this;
  var loader = this._loader;

  function update(files, updateSuccess, updateFailure) {
    if (!files) {
      throw new TypeError("Files is a required argument");
    }

    // Lil logic to allow calling code to override the success/failure handlers.
    updateSuccess = updateSuccess || success;
    updateFailure = updateFailure || failure;

    loader.fetch(files).then(function runBundler(modules) {
      createBundle(loader, modules, settings).then(updateSuccess, updateFailure);
    }, updateFailure);
  }

  function refresh(refreshSuccess, refhresFailure) {
    update(bundler._files, refreshSuccess, refhresFailure);
  }

  // Run the bundler...
  refresh();

  return {
    refresh: refresh,
    update: update
  };
};


function createBundle(loader, modules, options) {
  var stack    = modules.slice(0);
  var mods     = [];
  var finished = {};

  function processModule(mod) {
    if (finished.hasOwnProperty(mod.id)) {
      return;
    }

    mod = loader.getModule(mod.id);

    // browser pack chunk
    var browserpack = {
      id     : mod.id,
      source : mod.source,
      deps   : {}
    };

    // Gather up all dependencies
    var i, length, dep;
    for (i = 0, length = mod.deps.length; i < length; i++) {
      dep = mod.deps[i];
      stack.push(dep);
      browserpack.deps[dep.id] = dep.id;
    }

    finished[mod.id] = browserpack;
    mods.unshift(browserpack);
  }

  // Process all modules
  while (stack.length) {
    processModule(stack.pop());
  }

  var stream = browserPack(options).setEncoding("utf8");
  var promise = pstream(stream);

  stream.end(JSON.stringify(mods));
  return promise;
}


module.exports = Bundler;
