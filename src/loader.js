"use strict";

var Bitloader = require("bit-loader");
var utils = require("belty");
var pullingDeps = require("pulling-deps");
var resolvePath = require("bit-bundler-utils/resolvePath");
var readFile = require("bit-bundler-utils/readFile");
var pluginLoader = require("./pluginLoader");
var logger = require("./logger").create("bundler/loader");

var moduleNotFoundError = buildError.bind(null, "Unable to find module");
var moduleNotLoadedError = buildError.bind(null, "Unable to load module");
var moduleNotResolvedError = buildError.bind(null, "Unable to resolve module");

class Loader extends Bitloader {
  constructor(options) {
    options = options || {};

    super(utils.extend({}, options, {
      resolve: configureResolve(options),
      fetch: configureFetch(options),
      dependency: configureDependency(options),
      plugins: pluginLoader(options.plugins)
    }));
  }

  getCache() {
    return this.cache;
  }
}

function configureResolve(options) {
  var resolver = resolvePath.configure({baseUrl: options.baseUrl});

  return function resolveName(meta) {
    function handleError(err) {
      var message = err && err.message;

      if (message && message.indexOf("Cannot find module") === 0 && options.stubNotFound) {
        logger.warn("Module not found. Skipping it.", moduleNotFoundError(meta));
      }
      else {
        logger.error(moduleNotResolvedError(meta), err);
        throw err;
      }

      return {
        id: "@notfound",
        path: ""
      };
    }

    return resolver(meta).then(utils.identity, handleError);
  };
}

function configureFetch(options) {
  return function fetchModule(meta) {
    function handleError(err) {
      if (err && err.code === "ENOENT" && options.stubNotFound) {
        logger.warn("Module not found. Skipping it.", moduleNotFoundError(meta));
        return Promise.resolve({ source: "module.exports = require('" + meta.name + "')" });
      }

      logger.error(moduleNotLoadedError(meta), err);
      throw err;
    }

    return meta.id === "@notfound" && options.stubNotFound ?
      Promise.resolve({ source: "" }) :
      readFile(meta).then(utils.identity, handleError);
  };
}

function configureDependency(options) {
  var depsOptions = utils.assign({
    amd: false,
    cjs: true
  }, utils.pick(options, ["amd", "cjs"]));

  return function getDependencies(meta) {
    if (meta.source && /\.(js|jsx|mjs)/.test(meta.path)) {
      return {
        deps: pullingDeps(meta.source, depsOptions).dependencies
      };
    }
  };
}

function buildError(title, meta) {
  return title + " '" + meta.name + "'." + (meta.referrer ? " Referrer " + JSON.stringify(meta.referrer.path) : "");
}

module.exports = Loader;
