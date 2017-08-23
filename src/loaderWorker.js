"use strict";

var Loader = require("./loader");
var Workit = require("workit");
var es = require("event-stream");

class LoaderWorker extends Workit.Worker {
  init(options, done) {
    this.loader = new Loader(Object.assign({}, options, {
      log: {
        stream: es.map((chunk, callback) => {
          this.send("log", chunk);
          callback(null, chunk);
        })
      }}));

    done();
  }

  clear(options, done) {
    this.loader.clear();
    done();
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

module.exports = LoaderWorker;
