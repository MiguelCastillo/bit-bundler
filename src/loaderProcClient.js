var utils = require("belty");
var path = require("path");
var ProcessPool = require("./ProcessPool");

function LoaderProcClient(options) {
  this.options = utils.assign({}, options);
  this.cache = {};
  this.pending = {};
  this.pool = createPool(this, 4);
}

LoaderProcClient.prototype.fetch = function(names, referrer) {
  return Promise
    .all([].concat(names).map((name) => this._fetchOne(name, referrer)))
    .then((mod) => Array.isArray(names) ? mod : mod[0]);
};

LoaderProcClient.prototype.setModule = function(mod) {
  this.cache[mod.id] = mod;
};

LoaderProcClient.prototype.getModule = function(id) {
  return this.cache[id];
};

LoaderProcClient.prototype.deleteModule = function(mod) {
  delete this.cache[mod.id];
};

LoaderProcClient.prototype.getCache = function() {
  return this.cache;
};

LoaderProcClient.prototype._resolve = function(name, referrer) {
  return this.pool.queueMessage({
    type: "resolve",
    data: {
      name: name,
      referrer: referrer
    }
  });
};

LoaderProcClient.prototype._fetch = function(name, referrer) {
  return this.pool.queueMessage({
    type: "fetchShallow",
    data: {
      name: name,
      referrer: referrer
    }
  });
};

LoaderProcClient.prototype._fetchOne = function(name, referrer) {
  return this
    ._resolve(name, referrer)
    .then((modulePath) => {
      if (this.cache[modulePath]) {
        return this.cache[modulePath];
      }
      else if (this.pending[modulePath]) {
        return this.pending[modulePath];
      }

      var pending = this._fetch(name, referrer);
      this.pending[modulePath] = pending;

      return pending
        .then((mod) => {
          delete this.pending[mod.path];
          this.setModule(mod);

          if (!mod.deps.length) {
            return mod;
          }

          // console.log("deps", mod.name, mod.deps);

          return Promise.all(
            mod.deps
              .filter(Boolean)
              .map((dep) => this._fetchOne(dep, mod))
          )
          .then((deps) => {
            mod.deps = deps.map(dep => Object.assign({}, dep, { deps: [] }));
            return mod;
          });
        });
  });
}

function createPool(loader, size) {
  var pool = new ProcessPool(size, path.resolve(__dirname, "./loaderProcServer.js"));

  pool.procs.forEach((proc) => {
    proc.handle.stdout.pipe(process.stdout);
    proc.handle.stderr.pipe(process.stderr);
    pool.queueMessage({ type: "init", data: loader.options }, proc);
  });

  return pool;
}

module.exports = LoaderProcClient;
