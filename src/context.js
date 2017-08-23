"use strict";

var utils = require("belty");
var File = require("src-dest");
var Bundle = require("./bundle");
var loggerFactory = require("./logger");

var logger = loggerFactory.create("bundler/build");

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

class Context {
  constructor(options) {
    utils.merge(this, defaults, options);
  }

  configure(options) {
    return !options || this === options ? this : new Context(utils.extend({}, this, options));
  }

  execute(files) {
    return this.loader
      .fetch(files)
      .then((modules) => {
        var updates = flattenModules(this.loader, modules);
        var bundle = this.bundle || new Bundle("main", { dest: this.file.dest }, true);

        // TODO:
        // https://github.com/MiguelCastillo/bit-bundler/issues/81
        // Add logic to handle ability to also include new dependencies.
        // But in the meantime, we will just reprocess everything.
        //updates = this.lastUpdatedModules ? onlyChanged(files, updates) : updates;

        return this.bundler.bundle(this.configure({
          cache: this.loader.getCache(),
          modules: this.modules ? this.modules : modules,
          lastUpdatedModules: updates,
          bundle: bundle,
          shards: {},
          exclude: []
        }));
      });
  }

  setFile(file) {
    return this.configure({
      file: new File(file)
    });
  }

  visitBundles(visitor) {
    return Object
      .keys(this.shards)
      .reduce((context, name) => this.setShard(name, visitor(this.shards[name])), this.setBundle(visitor(this.bundle)));
  };

  setBundle(bundle) {
    return this.configure({
      bundle: bundle ? this.bundle.configure(bundle) : this.bundle.clear()
    });
  }

  setShard(name, shard, dest) {
    var shards = utils.extend({}, this.shards);

    if (shard) {
      shards[name] = new Bundle(name, shard);
      shards[name].dest = shard.dest || dest || name;
    }
    else {
      delete shards[name];
    }

    return this.configure({
      shards: shards
    });
  }

  deleteShard(name) {
    var shards = utils.extend({}, this.shards);
    delete shards[name];

    return this.configure({
      shards: shards
    });
  }

  addExclude(exclude) {
    exclude = this.exclude
      .concat(utils.toArray(exclude))
      .reduce((container, item) => {
        container[item] = true;
        return container;
      }, {});

    return this.configure({
      exclude: Object.keys(exclude)
    });
  }

  getLogger(name) {
    return loggerFactory.create(name);
  }
}

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
