"use strict";

var path = require("path");
var logger = require("./logger");
var WorkerPool = require("worker-pool");

class LoaderProcClient {
  constructor(options) {
    this.options = Object.assign({}, options);
    this.cache = {};
    this.pending = {};
    this.pool = createPool(this, options.multiprocess);
  }

  fetch(names, referrer) {
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
  }

  setModule(mod) {
    this.cache[mod.id] = mod;
  }

  getModule(id) {
    return this.cache[id];
  }

  deleteModule(mod) {
    delete this.cache[mod.id];
  }

  getCache() {
    return this.cache;
  }

  _fetchMany(names, referrer) {
    return Promise.all(names.map(name => this._fetchOne(name, referrer)));
  }

  _fetchOne(name, referrer) {
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
          mod.deps = deps.map((dep, i) => Object.assign({}, dep, { deps: [], name: mod.deps[i] }));
          return mod;
        });
      });
    });
  }
}

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
  var pool = new WorkerPool(path.join(__dirname, "./loaderProcServer.js"), {
    size: size,
    log: (chunk) => logger._stream.write(chunk)
  });

  pool.procs.forEach((proc) => {
    proc.handle.stdout.pipe(process.stdout);
    proc.handle.stderr.pipe(process.stderr);
    pool.send("init", loader.options, proc);
  });

  return pool;
}

module.exports = LoaderProcClient;
