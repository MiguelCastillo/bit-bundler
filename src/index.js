var defaultOptions = require("./defaultOptions");
var types = require("dis-isa");
var utils = require("belty");
var Loader = require("./loader");
var Bundler = require("./bundler");
var Context = require("./context");


function Runner(options) {
  if (!(this instanceof Runner)) {
    return new Runner(options);
  }

  options = options || {};
  this.loader = createLoader(options.loader);
  this.bundler = createBundler(options.bundler);
}


Runner.prototype.bundle = function(files) {
  var runner = this;

  if (!files) {
    throw new TypeError("Must provide or configure Files to bundle");
  }

  if (!types.isArray(files)) {
    files = [files];
  }

  return this.loader.fetch(files)
    .then(function(modules) {
      return createBundleContext(runner.loader, modules);
    })
    .then(function(bundleContext) {
      return runner.bundler.bundle(bundleContext);
    });
};


function createLoader(options) {
  return new Loader(utils.merge({}, defaultOptions.loader, options));
}


function createBundler(options) {
  return new Bundler(utils.merge({}, defaultOptions.bundler, options));
}


function createBundleContext(loader, modules) {
  var i = 0;
  var stack = modules.slice(0);
  var id, mod, cache = {};

  while (stack.length !== i) {
    id = stack[i++].id;

    if (cache.hasOwnProperty(id)) {
      continue;
    }

    mod = loader.getModule(id);
    stack = stack.concat(mod.deps);
    cache[mod.id] = mod;
  }

  return new Context({
    cache: cache,
    modules: modules
  });
}


module.exports = Runner;
