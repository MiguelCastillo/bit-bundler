var logger = require("loggero").create("bundler/bundler-index");
var Bitloader = require("bit-loader");
var Bundler = require("./bundler");
var fileReader = require("./fileReader");
var resolvePath = require("./resolvePath");
var utils = require("belty");
var defaultOptions = require("./defaultOptions");


function createLoader(options) {
  var loader = new Bitloader({
    resolve: configureResolve(options),
    fetch: configureFetch(options),
    doNotIgnoreNodeModules: true
  });

  if (options.debug) {
    Bitloader.logger.enable();
  }

  return loader;
}


function createBundler(options) {
  options = utils.merge({}, defaultOptions, options);
  var loader = createLoader(options);
  return new Bundler(loader, options);
}


function configureResolve(options) {
  var resolver = resolvePath.configure({baseUrl: options.baseUrl});

  return function resolveName(meta) {
    return resolver(meta).then(function(result) {
      if (!result) {
        if (options.ignoreNotFound) {
          return {
            path: null
          };
        }
        else {
          logger.error("Cannot find module " + meta.name);
          throw new Error("Cannot find module " + meta.name);
        }
      }

      return result;
    });
  }
}


function configureFetch(options) {
  return function fetchModule(meta) {
    if (!meta.path && options.ignoreNotFound) {
      return {
        source: ""
      };
    }

    return fileReader(meta);
  };
}


module.exports = createBundler;
