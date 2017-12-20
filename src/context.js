"use strict";

var utils = require("belty");
var Bundle = require("./bundle");
var loggerFactory = require("./logger");
var flattenModules = require("./flattenModules");

var defaults = {
  cache: {},
  exclude: [],
  shards: {}
};

class Context {
  constructor(options) {
    utils.merge(this, defaults, options);
  }

  configure(options) {
    return !options || this === options ? this : new Context(Object.assign({}, this, options));
  }

  updateBundles(visitor) {
    return Object
      .keys(this.shards)
      .reduce((context, name) => context.setBundle(context.shards[name].configure(visitor(context.shards[name]))), this);
  }

  visitBundles(visitor) {
    Object
      .keys(this.shards)
      .forEach((name) => visitor(this.shards[name]));

    return this;
  }

  getBundles(names) {
    return names ?
      (Array.isArray(names) ? names.map(name => this.shards[name]) : this.shards[names]) :
      (Object.keys(this.shards).map(shardName => this.shard[shardName]));
  }

  setBundle(bundle) {
    if (!bundle) {
      throw new Error("bundle cannot be null");
    }

    if (!bundle.name) {
      throw new Error("Must provide bundle.name");
    }

    const shard = (
      bundle instanceof Bundle ? bundle :
      this.shards[bundle.name] ? this.shards[bundle.name].configure(bundle) :
      new Bundle(bundle.name, Object.assign({}, bundle))
    );

    return this.configure({
      shards: Object.assign({}, this.shards, {
        [shard.name]: shard
      })
    });
  }

  deleteBundle(name) {
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

  flattenModules(modules) {
    return flattenModules(this.cache, modules || this.modules);
  }

  setCache(cache) {
    return this.configure({
      cache: Object.keys(cache).filter(id => this.exclude.indexOf(id) === -1).reduce((accumulator, id) => (accumulator[id] = cache[id], accumulator), {})
    });
  }

  getCache() {
    return this.cache;
  }

  getModules(ids) {
    return ids ?
      (Array.isArray(ids) ? ids.map(id => this.cache[id]) : this.cache[id]) :
      (Object.keys(this.cache).map(id => this.cache[id]));
  }

  getLogger(name) {
    return loggerFactory.create(name);
  }
}

module.exports = Context;
