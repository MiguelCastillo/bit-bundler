var utils = require("belty");
var path = require("path");
var ProcessPool = require("./proc/pool");

function LoaderProcClient(options) {
  this.options = utils.assign({}, options);
  this.cache = {};
  this.pending = {};
  this.pool = createPool(this, options.multiprocess);
}

LoaderProcClient.prototype.fetch = function(names, referrer) {
  return Promise
    .all([].concat(names).map((name) => this._fetchOne(name, referrer)))
    .then((mod) => {
      this.pool.procs.map(proc => this.pool.send("clear", null, proc));
      return Array.isArray(names) ? mod : mod[0];
    })
    .catch(err => {
      this.pool.procs.map(proc => this.pool.send("clear", null, proc));
      throw err;
    });
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
  return this.pool.send("resolve", {
    name: name,
    referrer: referrer
  });
};

LoaderProcClient.prototype._fetch = function(name, referrer) {
  return this.pool.send("fetchShallow", {
    name: name,
    referrer: referrer
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
  var pool = new ProcessPool(path.join(__dirname, "./loaderProcServer.js"), { size: size });

  pool.procs.forEach((proc) => {
    proc.handle.stdout.pipe(process.stdout);
    proc.handle.stderr.pipe(process.stderr);
    pool.send("init", loader.options, proc);
  });

  return pool;
}

module.exports = LoaderProcClient;
