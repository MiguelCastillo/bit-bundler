var childProcess = require("child_process");
var maxProcess = require("os").cpus().length;

var processState = {
  "available": 0,
  "executing": 1
}

function Pool(file, options) {
  var settings = Object.assign({
    cwd: process.cwd(),
    env: process.env,
    silent: true,
    size: 2
  }, options);

  var size = Math.min(options.size, maxProcess);

  this.id = 1;
  this.pending = {};
  this.messageQueue = [];

  this.procs = Array.apply(null, Array(size)).map(() => ({
    state: processState.available,
    handle: childProcess.fork(file, [], settings)
  }));

  this.procs.forEach(proc => registerProcHandlers(this, proc));
}

Pool.prototype.send = function(type, data, proc) {
  var id = this.id++;

  return new Promise((resolve, reject) => {
    this.messageQueue.push({
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
    processNextMessage(this);
    return result;
  });
};

function processNextMessage(pool, proc) {
  if (!pool.messageQueue.length) {
    return;
  }

  var availableProc = proc && proc.state === processState.available ? proc : pool.procs.find((proc) => proc.state === processState.available);

  if (availableProc) {
    var envelope = pool.messageQueue.shift(); // FILO
    pool.pending[envelope.message.id] = envelope;
    availableProc.state = processState.executing;
    availableProc.handle.send(envelope.message);
    // console.log(`process [${availableProc.handle.pid}]`, envelope.message.id, envelope.message.content.type, envelope.message.content.data.name || "");
  }
}

function registerProcHandlers(pool, proc) {
  proc.handle
    .on("error", (error) => {
      console.error(`===> process error [${proc.handle.pid}]` + error);
    })
    .on("message", (message) => {
      if (pool.pending.hasOwnProperty(message.id)) {
        proc.state = processState.available;
        handleResult(message, pool.pending[message.id], proc);
        delete pool.pending[message.id];
      }
      // else if (message.id && pool.forwarding.hasOwnProperty(message.type)) {
      //   Promise.resolve(pool.forwarding[message.type](message.data))
      //     .then((data) => { proc.handle.send({ id: message.id, data: data }); })
      //     .catch((error) => { proc.handle.send({ id: message.id, error: error }); });
      // }
    });
}

function handleResult(message, pending, proc) {
  message.error ?
    pending.reject(message.error) :
    pending.resolve(message.data);
}

module.exports = Pool;
