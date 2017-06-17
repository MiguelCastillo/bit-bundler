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
  var deferred = Array.isArray(names) ? this._fetchMany(names, referrer) : this._fetchOne(names, referrer);

  return deferred
    .then(result => {
      this.pool.procs.map(proc => this.pool.send("clear", null, proc));
      return result;
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

LoaderProcClient.prototype._fetchMany = function(names, referrer) {
  return Promise.all(names.map(name => this._fetchOne(name, referrer)));
};

LoaderProcClient.prototype._fetchOne = function(name, referrer) {
  return resolve(this, name, referrer).then((modulePath) => {
    if (this.cache[modulePath]) {
      return this.cache[modulePath];
    }
    else if (this.pending[modulePath]) {
      return this.pending[modulePath];
    }

    var pending = fetch(this, name, referrer);
    this.pending[modulePath] = pending;

    return pending.then(mod => {
      delete this.pending[mod.path];
      this.setModule(mod);

      if (!mod.deps.length) {
        return mod;
      }

      // console.log("deps", mod.name, mod.deps);

      return this._fetchMany(mod.deps, mod).then(deps => {
        mod.deps = deps.map(dep => Object.assign({}, dep, { deps: [] }));
        return mod;
      });
    });
  });
};

function resolve(loader, name, referrer) {
  return loader.pool.send("resolve", {
    name: name,
    referrer: referrer
  });
}

function fetch(loader, name, referrer) {
  return loader.pool.send("fetchShallow", {
    name: name,
    referrer: referrer
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
