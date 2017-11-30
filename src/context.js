"use strict";

var utils = require("belty");
var Bundle = require("./bundle");
var loggerFactory = require("./logger");

var defaults = {
  bundle: null,
  cache: {},
  exclude: [],
  modules: null,
  shards: {},
  lastUpdatedModules: null
};

class Context {
  constructor(options) {
    utils.merge(this, defaults, options);
  }

  configure(options) {
    return !options || this === options ? this : new Context(utils.assign({}, this, options));
  }

  visitBundles(visitor) {
    return Object
      .keys(this.shards)
      .reduce((context, name) => this.setShard(name, visitor(this.shards[name])), this.setBundle(visitor(this.bundle)));
  };

  setBundle(bundle) {
    return this.configure({
      bundle: this.bundle ? (bundle ? this.bundle.configure(bundle) : this.bundle.clear()) : bundle
    });
  }

  setShard(name, shard, dest) {
    var shards = utils.assign({}, this.shards);

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
    var shards = utils.assign({}, this.shards);
    delete shards[name];

    return this.configure({
      shards: shards
    });
  }

  addExclude(exclude) {
    exclude = this.exclude
      .concat(exclude)
      .filter(Boolean)
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

module.exports = Context;
