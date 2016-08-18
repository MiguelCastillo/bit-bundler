var Bitloader = require("bit-loader");
var utils = require("belty");
var logger = require("loggero").create("bundler/loader");
var resolvePath = require("bit-bundler-utils/resolvePath");
var readFile = require("bit-bundler-utils/readFile");


function Loader(options) {
  Bitloader.call(this, utils.extend({
    resolve: configureResolve(options),
    fetch: configureFetch(options)
  }, options));

  this.log(options.log);
}


Loader.prototype = Object.create(Bitloader.prototype);
Loader.prototype.constructor = Loader;


Loader.prototype.log = function(level) {
  var logger = Bitloader.logger;

  if (level) {
    if (level === true) {
      level = "info";
    }

    logger.enable();
    logger.level(logger.levels[level]);
  }
  else {
    logger.disable();
  }

  return this;
};


function configureResolve(options) {
  var resolver = resolvePath.configure({baseUrl: options.baseUrl});

  return function resolveName(meta) {
    function handleError(err) {
      var message = err && err.message;

      if (message && message.indexOf("Cannot find module") === 0 && options.ignoreNotFound) {
        logger.warn("Module not found", buildModuleNotFoundError(meta));
      }
      else {
        err = buildModuleNotFoundError(meta);
        logger.error(err);
        throw new Error(err);
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
      var error = buildModuleNotFoundError(meta, err);
      logger.error(error);
      throw new Error(error);
    }

    return meta.id === "@notfound" && options.ignoreNotFound ?
      Promise.resolve({ source: "" }) :
      readFile(meta).then(utils.identity, handleError);
  };
}


function buildModuleNotFoundError(meta, err) {
  var error = "Unable find module \"" + meta.name + "\".";
  error += meta.referrer ? " Referrer " + JSON.stringify(meta.referrer.path) : "";
  error += err ? "\n" + err : "";
  return error;
}


module.exports = Loader;
