"use strict";

var Bitloader = require("@bit/loader");
var utils = require("belty");
var pullingDeps = require("pulling-deps");
var resolvePath = require("@bit/bundler-utils/resolvePath");
var readFile = require("@bit/bundler-utils/readFile");
var pluginLoader = require("../pluginLoader");
var logger = require("../logging").create("bundler/loader");

var moduleNotFoundError = buildError.bind(null, "Unable to find module");
var moduleNotLoadedError = buildError.bind(null, "Unable to load module");
var moduleNotResolvedError = buildError.bind(null, "Unable to resolve module");
const notResolvedCache = {};

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
      notResolvedCache[meta.name] = true;

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

    return resolver(meta).catch(handleError);
  };
}

function configureFetch(options) {
  return function fetchModule(meta) {
    function handleError(err) {
      if (err && err.code === "ENOENT" && options.stubNotFound) {
        logger.warn("Module not found. Skipping it.", moduleNotFoundError(meta));
        return { source: "" };
      }

      logger.error(moduleNotLoadedError(meta), err);
      throw err;
    }

    function handleSuccess({source}) {
      if (notResolvedCache[meta.name]) {
        delete notResolvedCache[meta.name];
      }

      return {
        source
      };
    }

    if (notResolvedCache[meta.name] && options.stubNotFound) {
      return Promise.resolve({ source: "" });
    }

    return readFile(meta).then(handleSuccess).catch(handleError);
  };
}

function configureDependency(options) {
  var depsOptions = utils.assign({
    amd: false,
    cjs: true
  }, utils.pick(options, ["amd", "cjs"]));

  return function getDependencies(meta) {
    if (meta.source && (checkExtensions(meta.path) || checkDependencies(meta.source))) {
      try {
        return {
          deps: pullingDeps(meta.source, depsOptions).dependencies
        };
      }
      catch(ex) {
      }
    }
  };
}

function checkExtensions(path) {
  return path && /[\w]+\.(js|jsx|mjs)$/.test(path);
}

function checkDependencies(source) {
  return source && /\brequire|import\b/.test(source);
}

function buildError(title, meta) {
  return title + " '" + meta.name + "'." + (meta.referrer ? " Referrer " + JSON.stringify(meta.referrer.path) : "");
}

module.exports = Loader;
