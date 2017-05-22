var path = require("path");
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

Loader.prototype.init = function() {
  return init(this, {
    type: "init",
    data: this.options
  });
};

Loader.prototype.fetch = function(name, referrer) {
  var loader = this;
  return send(this, {
    type: "fetch",
    data: {
      name: name,
      referrer: referrer
    }
  })
  .then(function(result) {
    loader.cache = result.cache;
    return result.module;
  });
};

Loader.prototype.getModule = function(id) {
  return this.cache[id];
};

Loader.prototype.deleteModule = function(mod) {
  delete this.cache[mod.id];
  send(this, {
    type: "delete",
    id: mod.id
  });
};

Loader.prototype.getCache = function() {
  return this.cache;
};


function init(loader, message) {
  if (loader._init) {
    return loader._init.deferred;
  }

  var id = loader.id++;
  var deferred = new Promise(function(resolve, reject) {
    loader._init = { id: id };
    loader._init.resolve = resolve;
    loader._init.reject = reject;
    loader._init.deferred = deferred;
    loader.loaderProc.send(utils.assign({ id: id }, message));
  });

  return deferred;
}

function send(loader, message) {
  var id = loader.id++;
  var deferred = new Promise(function(resolve, reject) {
    loader.pending[id] = {};
    loader.pending[id].resolve = resolve;
    loader.pending[id].reject = reject;
    loader.pending[id].deferred = deferred;

    loader.init().then(function() {
      return loader.loaderProc.send(utils.assign({ id: id }, message));
    });
  });

  return deferred;
}

function registerLoaderProcHandlers(loader) {
  loader.loaderProc
    .on("error", function(error) {
      console.error(error);
    })
    .on("message", function(message) {
      if (loader.pending.hasOwnProperty(message.id)) {
        handleResult(message, loader.pending[message.id]);
        delete loader.pending[message.id];
      }
      else if (loader._init.id === message.id) {
        handleResult(message, loader._init);
      }
    });
}

function handleResult(message, pending) {
  message.error ?
    pending.reject(message.error) :
    pending.resolve(message.data);
}

module.exports = Loader;
