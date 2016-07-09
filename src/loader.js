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
    return resolver(meta).then(function(result) {
      if (!result) {
        if (options.ignoreNotFound) {
          return {
            path: ""
          };
        }
        else {
          var error = buildModuleNotFoundError(meta);
          logger.error(error);
          throw new Error(error);
        }
      }

      return result;
    });
  };
}


function configureFetch(options) {
  return function fetchModule(meta) {
    function handleError(err) {
      if (options.ignoreNotFound) {
        return {
          source: ""
        };
      }
      else {
          var error = buildModuleNotFoundError(meta, err);
          logger.error(error);
          throw new Error(error);
      }
    }

    return readFile(meta).then(utils.identity, handleError);
  };
}


function buildModuleNotFoundError(meta, err) {
  var error = "Unable find module \"" + meta.name + "\".";
  error += meta.referrer ? " Referrer " + JSON.stringify(meta.referrer.path) : "";
  error += err ? "\n" + err : "";
  return error;
}


module.exports = Loader;
