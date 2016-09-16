var Bitloader = require("bit-loader");
var utils = require("belty");
var resolvePath = require("bit-bundler-utils/resolvePath");
var readFile = require("bit-bundler-utils/readFile");
var logger = require("./logger").create("bundler/loader");


function Loader(options) {
  Bitloader.call(this, utils.extend({
    resolve: configureResolve(options),
    fetch: configureFetch(options)
  }, options));
}


Loader.prototype = Object.create(Bitloader.prototype);
Loader.prototype.constructor = Loader;


function configureResolve(options) {
  var resolver = resolvePath.configure({baseUrl: options.baseUrl});

  return function resolveName(meta) {
    function handleError(err) {
      var message = err && err.message;

      if (message && message.indexOf("Cannot find module") === 0 && options.ignoreNotFound) {
        logger.warn("Module not found. Skipping it.", moduleNotFoundError(meta));
      }
      else {
        var error = moduleNotResolvedError(meta, err);
        logger.error(error);
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
      var error = moduleNotLoadedError(meta, err);
      logger.error(error);
      throw err;
    }

    return meta.id === "@notfound" && options.ignoreNotFound ?
      Promise.resolve({ source: "" }) :
      readFile(meta).then(utils.identity, handleError);
  };
}


var moduleNotFoundError = buildError.bind(null, "Unable to find module");
var moduleNotLoadedError = buildError.bind(null, "Unable to load module");
var moduleNotResolvedError = buildError.bind(null, "Unable to resolve module");

function buildError(title, meta, err) {
  var error = title + " \"" + meta.name + "\".";
  error += meta.referrer ? " Referrer " + JSON.stringify(meta.referrer.path) : "";
  error += err ? "\n" + err : "";
  return error;
}

module.exports = Loader;
