var utils = require("belty");
var types = require("dis-isa");
var File = require("src-dest");

var defaults = {
  file: null,
  bundle: null,
  cache: {},
  exclude: [],
  modules: null,
  parts: {},
  loader: null,
  bundler: null
};

function Context(options) {
  if (!(this instanceof Context)) {
    return new Context(options);
  }

  utils.merge(this, defaults, options);
}

Context.prototype.configure = function(options) {
  if (!options || this === options) {
    return this;
  }

  return new Context(utils.extend({}, this, options));
};

Context.prototype.execute = function(files) {
  var context = this;

  return context.loader
    .fetch(files)
    .then(function(modules) {
      return context.configure({
        cache: createCache(context.loader, modules),
        modules: context.modules ? context.modules : modules
      });
    })
    .then(function(result) {
      return result.bundler.bundle(result);
    });
};

Context.prototype.setFile = function(file) {
  return this.configure({
    file: new File(file)
  });
};

Context.prototype.setBundle = function(bundle) {
  return this.configure({
    bundle: bundle
  });
};

Context.prototype.addPart = function(name, part) {
  var parts = utils.extend({}, this.parts);
  parts[name] = part;

  return this.configure({
    parts: parts
  });
};

Context.prototype.removePart = function(name) {
  var parts = utils.extend({}, this.parts);
  delete parts[name];

  return this.configure({
    parts: parts
  });
};

Context.prototype.addExclude = function(exclude) {
  if (!types.isArray(exclude)) {
    exclude = [exclude];
  }

  exclude = this.exclude
    .concat(exclude)
    .reduce(function(container, item) {
      container[item] = true;
      return container;
    }, {});

  return this.configure({
    exclude: Object.keys(exclude)
  });
};

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

module.exports = Context;
