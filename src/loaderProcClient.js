var path = require("path");
var utils = require("belty");
var childProcess = require("child_process");

function LoaderProcClient(options) {
  this.options = utils.assign({}, options);
  this.cache = {};
  this.pending = {};
  this.id = 0;

  var proc = childProcess.fork(path.resolve(__dirname, "./loaderProcServer.js"), [], {
    cwd: process.cwd(),
    env: process.env,
    silent: true
  });

  this.proc = proc;

  proc.stdout.pipe(process.stdout);
  proc.stderr.pipe(process.stderr);
  registerProcHandlers(this);
}

LoaderProcClient.prototype.init = function() {
  return init(this, {
    type: "init",
    data: this.options
  });
};

LoaderProcClient.prototype.fetch = function(name, referrer) {
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

LoaderProcClient.prototype.getModule = function(id) {
  return this.cache[id];
};

LoaderProcClient.prototype.deleteModule = function(mod) {
  delete this.cache[mod.id];

  send(this, {
    type: "delete",
    id: mod.id
  });
};

LoaderProcClient.prototype.getCache = function() {
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
    loader.proc.send(utils.assign({ id: id }, message));
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
      return loader.proc.send(utils.assign({ id: id }, message));
    });
  });

  return deferred;
}

function registerProcHandlers(loader) {
  loader.proc
    .on("error", function(/*error*/) {
      // process.stderr.write(error);
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

module.exports = LoaderProcClient;
