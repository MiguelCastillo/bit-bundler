"use strict";

var Loader = require("./loader");
var es = require("event-stream");

class ProcServer {
  init(options, next) {
    this.loader = new Loader(Object.assign({}, options, {
      log: {
        stream: es.through(function(chunk) {
          process.send({ type: "chunk", data: chunk });
          this.emit("data", chunk);
        })
      }}));

    next();
  }

  clear(options, next) {
    this.loader.clear();
    next();
  }

  resolve(data) {
    return this.loader.resolve(data.name, data.referrer);
  }

  fetch(data) {
    return this.loader.fetch(data.name, data.referrer);
  }

  fetchShallow(data) {
    return this.loader.fetchShallow(data.name, data.referrer);
  }
}

module.exports = ProcServer;
