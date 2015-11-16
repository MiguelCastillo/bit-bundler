var browserPack = require("browser-pack");
var pstream     = require("p-stream");
var types       = require("dis-isa");
var utils       = require("belty");


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

  if (options.resolve) {
    this.resolve(options.resolve);
  }

  if (options.fetch) {
    this.fetch(options.fetch);
  }

  if (options.transform) {
    this.transform(options.transform);
  }

  if (options.dependency) {
    this.dependency(options.dependency);
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
  failure = failure || function() {};

  var bundler = this;
  var loader = this._loader;

  function update(files, updateSuccess, updateFailure) {
    if (!files) {
      throw new TypeError("Files is a required argument");
    }

    // Lil logic to allow calling code to override the success/failure handlers.
    updateSuccess = updateSuccess || success;
    updateFailure = updateFailure || failure;

    function runBundler(modules) {
      createBundle(bundler, modules, settings).then(updateSuccess, updateFailure);
    }

    loader.fetch(files).then(runBundler, updateFailure);
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


function createBundle(bundler, modules, options) {
  options       = utils.extend({ raw: true }, options);
  var loader    = bundler._loader;
  var stack     = modules.slice(0);
  var output    = [];
  var finished  = {};
  var ids       = {};
  var idCounter = 1;
  var pack      = browserPack(options);
  var promise   = pstream(pack);
  
  function getId(mod) {
    if (bundler._options.fullPaths) {
      return mod.id;
    }

    if (!ids[mod.id]) {
      ids[mod.id] = idCounter++;
    }
    
    return ids[mod.id];
  }

  function processModule(mod) {
    if (finished.hasOwnProperty(mod.id)) {
      return;
    }

    var id = getId(mod);
    mod = loader.getModule(mod.id);

    // browser pack chunk
    var browserpackConfig = {
      id     : id,
      deps   : {},
      path   : mod.path,
      source : mod.source
    };

    // Gather up all dependencies
    var i, length, dep;
    for (i = 0, length = mod.deps.length; i < length; i++) {
      dep = mod.deps[i];
      stack.push(dep);
      browserpackConfig.deps[dep.name] = getId(dep);
    }

    finished[mod.id] = browserpackConfig;
    output.push(browserpackConfig);
  }

  // Process all modules
  while (stack.length) {
    processModule(stack.pop());
  }

  // TODO: Determine how to set the entry fields.
  modules.forEach(function(mod) {
    finished[mod.id].entry = true;
  });

  output.forEach(function(mod) {
    pack.write(mod);
  });

  pack.end();
  return promise;
}


module.exports = Bundler;
