"use strict";

var path = require("path");
var logger = require("./logger");
var WorkerPool = require("worker-pool");

class LoaderPool {
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
        this.pool.workers.map(worker => worker.send("clear"));
        return result;
      })
      .catch(err => {
        this.pool.workers.map(worker => worker.send("clear"));
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
  var pool = new WorkerPool(path.join(__dirname, "./loaderWorker.js"), {
    size: size,
    log: (chunk) => logger._stream.write(chunk)
  });

  pool.workers.forEach((worker) => {
    worker.process.stdout.pipe(process.stdout);
    worker.process.stderr.pipe(process.stderr);
    worker.process.on("error", workerError);

    return worker
      .send("init", loader.options)
      .catch(initError);

    function initError(error) {
      worker.stop();
      logError(error);
      rejectWorkersQueue();
      rejectPoolsQueue();
    }

    function workerError(error) {
      logError(error);
      rejectWorkersQueue();
      rejectPoolsQueue();
    }

    function logError(error) {
      if (error) {
        process.stderr.write(error + "\n");
      }
    }

    function rejectWorkersQueue() {
      worker.rejectQueue();
    }

    function rejectPoolsQueue() {
      if (!pool.workers.length) {
        pool.rejectQueue();
      }
    }
  });

  return pool;
}

module.exports = LoaderPool;
