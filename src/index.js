var defaultOptions = require("./defaultOptions");
var types = require("dis-isa");
var utils = require("belty");
var Loader = require("./loader");
var Bundler = require("./bundler");
var Context = require("./context");
var File = require("./file");
var bundleWriter = require("./bundleWriter");


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

  var file = new File(files);

  return this.loader.fetch(file.src)
    .then(function(modules) {
      return new Context({
        cache: createCache(runner.loader, modules),
        file: file,
        modules: modules
      });
    })
    .then(function(context) {
      return runner.bundler.bundle(context);
    });
};


function createLoader(options) {
  return new Loader(utils.merge({}, defaultOptions.loader, options));
}


function createBundler(options) {
  return new Bundler(utils.merge({}, defaultOptions.bundler, options));
}


function createCache(loader, modules) {
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

  return cache;
}


Runner.dest = bundleWriter;
Runner.Context = Context;
Runner.File = File;
module.exports = Runner;
