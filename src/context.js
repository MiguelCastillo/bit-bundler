var utils = require("belty");
var File = require("src-dest");
var Bundle = require("./bundle");
var bundleWriter = require("./bundleWriter");
var loggerFactory = require("./logger");

var logger = loggerFactory.create("bundler/context");

var defaults = {
  file: null,
  bundle: null,
  cache: {},
  exclude: [],
  modules: null,
  shards: {},
  loader: null,
  bundler: null,
  lastUpdatedModules: null
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

  logger.log("build-start", files);

  return context.loader
    .fetch(files)
    .then(function(modules) {
      var updates = flattenModules(context.loader, modules);

      // TODO:
      // https://github.com/MiguelCastillo/bit-bundler/issues/81
      // Add logic to handle ability to also include new dependencies.
      // But in the meantime, we will just reprocess everything.
      //updates = context.lastUpdatedModules ? onlyChanged(files, updates) : updates;

      return context.configure({
        cache: context.loader.cache,
        modules: context.modules ? context.modules : modules,
        lastUpdatedModules: updates,
        bundle: null,
        shards: {},
        exclude: []
      });
    })
    .then(function(context) {
      return context.bundler.bundle(context);
    })
    .then(function(context) {
      return bundleWriter(context.file.dest)(context);
    })
    .then(function(context) {
      logger.log("build-success", utils.omit(context, ["loader", "bundler"]));
      return context;
    }, function(err) {
      logger.error("build-failed", err);
      throw err;
    });
};

Context.prototype.setFile = function(file) {
  return this.configure({
    file: new File(file)
  });
};

Context.prototype.visitBundles = function(visitor) {
  var context = this;

  return Object.keys(context.shards).reduce(function(context, shardFile) {
    return context.setShard(shardFile, visitor(context.shards[shardFile], shardFile, true));
  }, context.setBundle(visitor(context.bundle, context.file.dest, false)));
};

Context.prototype.setBundle = function(bundle) {
  if (bundle) {
    bundle = new Bundle(bundle.name || "main", bundle, true);
  }

  return this.configure({
    bundle: bundle
  });
};

Context.prototype.setShard = function(name, shard) {
  var shards = utils.extend({}, this.shards);
  shards[name] = new Bundle(name, shard);

  return this.configure({
    shards: shards
  });
};

Context.prototype.deleteShard = function(name) {
  var shards = utils.extend({}, this.shards);
  delete shards[name];

  return this.configure({
    shards: shards
  });
};

Context.prototype.addExclude = function(exclude) {
  exclude = this.exclude
    .concat(utils.toArray(exclude))
    .reduce(function(container, item) {
      container[item] = true;
      return container;
    }, {});

  return this.configure({
    exclude: Object.keys(exclude)
  });
};

Context.prototype.getLogger = function(name) {
  return loggerFactory.create(name);
};

function flattenModules(loader, modules) {
  var i = 0;
  var stack = modules.slice(0);
  var id, mod, cache = {};

  while (stack.length !== i) {
    if (!stack[i].id) {
      logger.warn("not-found", stack[i]);
    }

    id = stack[i++].id;

    if (!id || cache.hasOwnProperty(id)) {
      continue;
    }

    mod = loader.getModule(id);
    stack = stack.concat(mod.deps);
    cache[mod.id] = mod;
  }

  return cache;
}

// https://github.com/MiguelCastillo/bit-bundler/issues/81
// function onlyChanged(src, cache) {
//   return src.reduce(function(changedModules, item) {
//     changedModules[item] = cache[item];
//     return changedModules;
//   }, {});
// }

module.exports = Context;
