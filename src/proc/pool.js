var path = require("path");
var childProcess = require("child_process");
var maxProcess = require("os").cpus().length;

var processState = {
  "available": 0,
  "executing": 1,
  "stopped": 2
};

function Pool(file, options) {
  this.settings = Object.assign({
    cwd: process.cwd(),
    env: process.env,
    silent: true,
    size: 2
  }, options);

  var size = Math.min(this.settings.size, maxProcess);

  this.file = file;
  this.id = 1;
  this.pending = {};
  this.messageQueue = [];
  this.procs = [];
  this.size(size);
}

Pool.prototype.send = function(type, data, proc) {
  return new Promise((resolve, reject) => {
    var id = this.id++;
    var messageQueue = proc ? proc.messageQueue : this.messageQueue;

    messageQueue.push({
      message: {
        id: id,
        type: type,
        data: data
      },
      resolve: resolve,
      reject: reject
    });

    // console.log("queue", id, message.type);
    processNextMessage(this, proc);
  })
  .then((result) => {
    processNextMessage(this, proc);
    return result;
  });
};

Pool.prototype.kill = function(proc) {
  if (proc) {
    var index = this.procs.indexOf(proc);
    if (index !== -1) {
      this.procs.splice(index, 1);
      proc.handle.kill();
    }
  }
  else {
    var procs = this.procs;
    this.procs = [];
    procs.forEach((proc) => proc.handle.kill());
  }
};

Pool.prototype.size = function(size) {
  var currentSize = this.procs.length;

  if (size > currentSize) {
    this.add(size - currentSize);
  }
  else if (size < currentSize) {
    this.remove(currentSize - size);
  }
};

Pool.prototype.add = function(count) {
  var procs = Array.apply(null, Array(count)).map(() => ({
    messageQueue: [],
    state: processState.available,
    handle: childProcess.fork(path.join(__dirname, "./child.js"), [], this.settings)
  }));

  procs.forEach(proc => {
    registerProcHandlers(this, proc);
    initProc(this, proc, this.file);
  });

  this.procs = this.procs.concat(procs);
};

Pool.prototype.remove = function(count) {
  if (count <= 0) {
    throw new Error("Number of items to be removed must be greater than 0");
  }

  var procs = this.procs.filter(proc => {
    if (proc.state === processState.available && count) {
      proc.handle.kill();
      count--;
      return false;
    }

    return true;
  });

  procs = procs.filter((proc) => {
    if (count) {
      proc.state = processState.stopped;
      count--;
      return false;
    }

    return true;
  });

  this.procs = procs;
};

function processNextMessage(pool, proc) {
  var availableProc, messageQueue;

  if (proc && proc.state === processState.stopped && !proc.messageQueue.length) {
    proc.handle.kill();
  }

  if (proc && proc.state === processState.available && proc.messageQueue.length) {
    availableProc = proc;
    messageQueue = proc.messageQueue;
  }
  else {
    availableProc = pool.procs.find((proc) => proc.state === processState.available);
    messageQueue = pool.messageQueue;
  }

  if (availableProc && messageQueue.length) {
    var envelope = messageQueue.shift(); // FILO
    pool.pending[envelope.message.id] = envelope;
    availableProc.state = processState.executing;
    availableProc.handle.send(envelope.message);
    // console.log(`process [${availableProc.handle.pid}]`, envelope.message.id, envelope.message.content.type, envelope.message.content.data.name || "");
  }
}

function initProc(pool, proc, file) {
  pool.send("__init", file, proc);
}

function registerProcHandlers(pool, proc) {
  proc.handle
    .on("error", (error) => {
      process.stderr.write(`===> process error [${proc.handle.pid}]` + error + "\n");
    })
    .on("message", (message) => {
      if (pool.pending.hasOwnProperty(message.id)) {
        proc.state = proc.state === processState.executing ? processState.available : proc.state;
        handleResult(message, pool.pending[message.id], proc);
        delete pool.pending[message.id];
      }
      else if (typeof pool.settings[message.type] === "function") {
        if (message.id) {
          Promise.resolve(pool.settings[message.type](message.data))
            .then(data => proc.handle.send({ id: message.id, data: data }))
            .catch(error => proc.handle.send({ id: message.id, error: error }));
        }
        else {
          pool.settings[message.type](message.data);
        }
      }
    });
}

function handleResult(message, pending) {
  message.error ?
    pending.reject(message.error) :
    pending.resolve(message.data);
}

module.exports = Pool;
