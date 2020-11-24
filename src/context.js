"use strict";

var utils = require("belty");
var Bundle = require("./bundle");
var logging = require("./logging");
var flattenModules = require("./flattenModules");

var defaults = {
  cache: {},
  exclude: [],
  shards: {}
};

class Context {
  constructor() {
    utils.merge(this, defaults);
  }

  configure(options) {
    if (!options || this === options) {
      return this;
    }

    // Shallow copy so that we dont override what the methods
    // calling configure did.
    const newValues = Object.assign({}, this, options);
    return Object.assign(new Context(), newValues);
  }

  updateBundles(visitor) {
    return Object
      .keys(this.shards)
      .reduce((context, name) => {
        const result = visitor(context.shards[name]);
        const updatedBundle = context.shards[name].configure(result);
        return context.setBundle(updatedBundle);
      }, this);
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
      (Object.keys(this.shards).map(shardName => this.shards[shardName]));
  }

  setBundle(bundle) {
    let shard = null;

    if (bundle instanceof Bundle) {
      shard = bundle;
    }
    else {
      if (!bundle) {
        throw new Error("bundle cannot be null");
      }

      if (!bundle.name) {
        throw new Error("Must provide bundle.name");
      }

      shard = (this.shards[bundle.name] ?
        this.shards[bundle.name].configure(bundle) :
        new Bundle(bundle.name, bundle)
      );
    }

    return this.configure({
      shards: Object.assign({}, this.shards, {
        [shard.name]: shard
      })
    });
  }

  deleteBundle(name) {
    var shards = Object.assign({}, this.shards);
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
      cache: Object
        .keys(cache)
        .filter(id => this.exclude.indexOf(id) === -1)
        .reduce((accumulator, id) => (accumulator[id] = cache[id], accumulator), {})
    });
  }

  getCache() {
    return this.cache;
  }

  getModules(ids) {
    return ids ?
      (Array.isArray(ids) ? ids.map(id => this.cache[id]) : this.cache[ids]) :
      (Object.keys(this.cache).map(id => this.cache[id]));
  }

  getLogger(name) {
    return logging.create(name);
  }
}

module.exports = Context;
