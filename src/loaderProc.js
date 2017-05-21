var Bitloader = require("bit-loader");
var utils = require("belty");
var resolvePath = require("bit-bundler-utils/resolvePath");
var readFile = require("bit-bundler-utils/readFile");
var pluginLoader = require("./pluginLoader")
var logger = require("./logger").create("bundler/loader");

var moduleNotFoundError = buildError.bind(null, "Unable to find module");
var moduleNotLoadedError = buildError.bind(null, "Unable to load module");
var moduleNotResolvedError = buildError.bind(null, "Unable to resolve module");

function Loader(options) {
  Bitloader.call(this);
  registerMessageHandlers(this);
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
      if (err && err.code === "ENOENT" && options.ignoreNotFound) {
        logger.warn("Module not found. Skipping it.", moduleNotFoundError(meta));
        return Promise.resolve({ source: "module.exports = require('" + meta.name + "')" });
      }

      logger.error(moduleNotLoadedError(meta), err);
      throw err;
    }

    return meta.id === "@notfound" && options.ignoreNotFound ?
      Promise.resolve({ source: "" }) :
      readFile(meta).then(utils.identity, handleError);
  };
}

function buildError(title, meta) {
  return title + " '" + meta.name + "'." + (meta.referrer ? " Referrer " + JSON.stringify(meta.referrer.path) : "");
}

function registerMessageHandlers(loader) {
  process.on("message", function(message) {
    switch(message.type) {
      case "init":
        var options = message.data;

        loader = loader
          .configure(utils.extend({}, options, {
            resolve: configureResolve(options),
            fetch: configureFetch(options),
            plugins: pluginLoader(options.plugins)
          }));

        process.send({ id: message.id });
        break;
      case "fetch":
        loader
          .fetch(message.data.name)
          .then(function(module) {
            process.send({
              id: message.id,
              data: {
                module: module,
                cache: loader.cache
              }
            });
          })
          .catch(function(error) {
            process.send({
              id: message.id,
              error: error
            });
          });
        break;
      case "delete":
        loader.deleteModule(module.data.id);
        process.send({ id: message.id });
        break;
    }
  });
}


module.exports = Loader;
module.exports.instance = new Loader();
