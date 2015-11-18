var browserPack = require("browser-pack");
var pstream = require("p-stream");
var types = require("dis-isa");
var utils = require("belty");
var getUniqueId = require("./getUniqueId");
var builtInsProcessor = require("./builtInsProcessor");
var defaultBrowserPackOptions = require("./defaultBrowserPackOptions");


function Bundler(loader, options) {
  this._loader = loader;
  this._files = [];
  this._options = {};

  if (options.builtin !== false) {
    this.resolve(builtInsProcessor.resolve);
    this.transform(builtInsProcessor.transform);
  }

  this.configure(options);
}


Bundler.prototype.configure = function(options) {
  var bundler = this;

  Object.keys(options)
    .filter(function(option) {
      return types.isFunction(bundler[option]);
    })
    .forEach(function(option) {
      bundler[option](options[option]);
    })

  this._options = utils.merge({}, this._options, options);
  return this;
}


Bundler.prototype.files = function(files) {
  if (!files) {
    throw new TypeError("Files is a required argument");
  }

  if (types.isString(files)) {
    files = [files];
  }

  this._files = this._files.concat(files); // I like that we have new array.
  return this;
};


Bundler.prototype.ignore = function(config) {
  this._loader.ignore(config);
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
Bundler.prototype.bundle = function(success, failure) {
  success = success || utils.noop;
  failure = failure || utils.noop;

  var bundler = this;

  function update(files, updateSuccess, updateFailure) {
    if (!files) {
      throw new TypeError("Must provide Files to bundle");
    }

    // Lil logic to allow calling code to temporarilly override the success/failure
    // handlers for a particular execution of the bundler.
    updateSuccess = updateSuccess || success;
    updateFailure = updateFailure || failure;

    function runBundler(modules) {
      var bpModules = toBrowserPackModules(bundler, modules);
      var bpOptions = configureBrowserPack(bundler, bpModules);
      writeBrowserPackModules(bpModules, bpOptions).then(updateSuccess, updateFailure);
    }

    bundler._loader.fetch(files).then(runBundler, updateFailure);
  }

  function run(refreshSuccess, refhresFailure) {
    update(bundler._files, refreshSuccess, refhresFailure);
  }

  // Run the bundler...
  run();

  return {
    refresh: run,
    update: update
  };
};


/**
 * Creates browser pack settings.
 *
 * @param {Bundler} bundler - Bundler instance to build browser pack settings from
 * @param {Object} modules - Browser pack compatible modules
 *
 * @returns {Object} Browser pack settings.
 */
function configureBrowserPack(bundler, modules) {
  return utils.merge({}, defaultBrowserPackOptions, bundler._options.browserPack);
}


/**
 * Converts modules from bit loader to browser pack
 *
 * @param {Bundler} bundler - Instance of the bundler
 * @param {Module[]} modules - Collection of modules generated by bit loader to be converted
 *  to browser pack compatible modules
 *
 * @return {Object[]} Collection of browser pack compatible modules.
 */
function toBrowserPackModules(bundler, modules) {
  var loader = bundler._loader;
  var stack = modules.slice(0);
  var bpModules = [];
  var byId = {};
  var getId = bundler._options.fullPaths ? utils.noop : getUniqueId;

  function processModule(mod) {
    if (byId.hasOwnProperty(mod.id)) {
      return;
    }

    mod = loader.getModule(mod.id);

    // browser pack mod
    var bpMod = {
      id     : getId(mod.id),
      deps   : {},
      path   : mod.path,
      source : mod.source,
      entry  : false
    };

    byId[mod.id] = bpMod;
    bpModules.push(bpMod);

    var i, length, dep;
    for (i = 0, length = mod.deps.length; i < length; i++) {
      dep = mod.deps[i];
      bpMod.deps[dep.name] = getId(dep.id);
      stack.push(dep);
    }
  }

  // Process all modules
  while (stack.length) {
    processModule(stack.pop());
  }

  modules.forEach(function(mod, i) {
    byId[mod.id].entry = true;
  });

  return bpModules;
}


/**
 * Generate bundle with browser pack
 *
 * @param {Object[]} modules - Collection of browser pack modules to be processed
 *  by browser pack
 * @param {Object} options - Browser pack options
 *
 * @returns {Promise} That when resolved will provide the generated bundle as a string
 */
function writeBrowserPackModules(modules, options) {
  var pack    = browserPack(options);
  var promise = pstream(pack);

  modules.forEach(function(mod) {
    pack.write(mod);
  });

  pack.end();
  return promise;
}


module.exports = Bundler;
