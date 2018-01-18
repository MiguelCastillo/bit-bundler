"use strict";

const path = require("path");
const utils = require("belty");
const Workit = require("workit");
const logger = require("../logger");

class WorkerPool extends Workit.Pool {
  log(chunk) {
    logger._stream.write(chunk);
  }
}

class LoaderPool {
  constructor(options) {
    this.options = Object.assign({}, options);
    this.cache = {};
    this.pending = {};
    this.pool = createPool(this, options.multiprocess);
  }

  fetch(file, referrer) {
    return (
      file.content ?
        this._fetchContent(file) :
      file.src.length === 1 ?
        this._fetchOne({ name: file.src[0] }, referrer) :
        this._fetchMany(file.src.map(src => ({ name: src }), referrer)
    ))
    .then(result => {
      this.pool.workers.map(worker => worker.invoke("clear"));
      return result;
    })
    .catch(err => {
      this.pool.workers.map(worker => worker.invoke("clear"));
      throw err;
    });
  }

  setModule(mod) {
    this.cache[mod.id] = mod;
    return mod;
  }

  hasModule(id) {
    return this.cache.hasOwnProperty(id);
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

  _fetchMany(modules, referrer) {
    return Promise.all(modules.map(mod => this._fetchOne(mod, referrer)));
  }

  _fetchOne(mod, referrer) {
    return mod.path ?
      Promise.resolve(this._buildTree(mod, referrer)) :
      resolveModuleName(this, mod.name, referrer)
        .then(modulePath => this._buildTree(Object.assign({}, mod, { path: modulePath }), referrer));
  }

  _fetchContent(file, referrer) {
    return fetchModule(this, file, referrer).then(mod => {
      return this
        ._fetchDependencies(this.setModule(mod))
        .then(mod => this.setModule(mod));
    });
  }

  _fetchDependencies(mod) {
    if (!mod.deps.length) {
      return Promise.resolve(mod);
    }

    return this._fetchMany(mod.deps, mod).then(dependencies => {
      const deps = dependencies.map((dep, i) => Object.assign(utils.omit(dep, ["source"]), mod.deps[i], {
        deps: [],
        referrer: utils.pick(mod, ["name", "path"])
      }));

      return Object.assign({}, mod, { deps: deps });
    });
  }

  _buildTree(meta, referrer) {
    if (this.cache[meta.path]) {
      return this.cache[meta.path];
    }
    else if (this.pending[meta.path]) {
      return this.pending[meta.path];
    }

    this.pending[meta.path] = fetchModule(this, meta, referrer);

    return this.pending[meta.path]
      .then(mod => {
        return this
          ._fetchDependencies(this.setModule(mod))
          .then(mod => this.setModule(mod));
      })
      .then(mod => {
        delete this.pending[meta.path];
        return mod;
      })
      .catch(ex => {
        delete this.pending[meta.path];
        throw ex;
      });
  };
}

function resolveModuleName(loader, name, referrer) {
  return loader.pool.invoke("resolve", {
    name: name,
    referrer: referrer
  });
}

function fetchModule(loader, file, referrer) {
  return loader.pool.invoke("fetchShallow", {
    file: file,
    referrer: referrer
  });
}

function createPool(loader, size) {
  var pool = new WorkerPool(path.join(__dirname, "./worker.js"), {
    size: size === true ? 2 : size,
    silent: true
  }, ["--color"]);

  pool.workers.forEach((worker) => {
    worker.process.stdout.pipe(process.stdout);
    worker.process.stderr.pipe(process.stderr);
    worker.process.on("error", workerError);

    return worker
      .invoke("init")
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
