const loggers = require("@bit/bundler/loggers");
const loaderFilter = require("@bit/bundler/loggers/loaderFilter");
const JSONStream = require("JSONStream");
const net = require("net");

// TCP client to write to logstash with.
const client = net.createConnection({ port: 9400 });

module.exports = {
  log: loggers.sequence(loaderFilter(), JSONStream.stringify(false), client),
  src: "src/main.js",
  dest: "dist/out.js",

  notifications: [{
    "build-end": () => {
      client.end();
    }
  }]
};
