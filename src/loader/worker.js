"use strict";

const Loader = require("./index");
const Workit = require("workit");
const es = require("event-stream");
const options = require("./options")(require("../options")(process.argv.slice(2)));

class LoaderWorker extends Workit.Worker {
  init() {
    this.loader = new Loader(Object.assign({}, options, {
      log: {
        stream: es.map((chunk, callback) => {
          this.invoke("log", chunk);
          callback(null, chunk);
        })
      }}));

    return Promise.resolve();
  }

  clear() {
    this.loader.clear();
    return Promise.resolve();
  }

  resolve(data) {
    return this.loader.resolve(data.name, data.referrer);
  }

  fetch(data) {
    return this.loader.fetch(data.file, data.referrer);
  }

  fetchShallow(data) {
    return this.loader.fetchShallow(data.file, data.referrer);
  }
}

module.exports = LoaderWorker;
