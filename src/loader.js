var Bitloader = require("bit-loader");
var utils = require("belty");
var resolvePath = require("bit-bundler-utils/resolvePath");
var readFile = require("bit-bundler-utils/readFile");
var pluginLoader = require("./pluginLoader");
var logger = require("./logger").create("bundler/loader");


function Loader(options) {
  Bitloader.call(this, utils.extend({}, options, {
    resolve: configureResolve(options),
    fetch: configureFetch(options),
    plugins: pluginLoader(options.plugins)
  }));
}


Loader.prototype = Object.create(Bitloader.prototype);
Loader.prototype.constructor = Loader;


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


var moduleNotFoundError = buildError.bind(null, "Unable to find module");
var moduleNotLoadedError = buildError.bind(null, "Unable to load module");
var moduleNotResolvedError = buildError.bind(null, "Unable to resolve module");

function buildError(title, meta) {
  return title + " '" + meta.name + "'." + (meta.referrer ? " Referrer " + JSON.stringify(meta.referrer.path) : "");
}

module.exports = Loader;
