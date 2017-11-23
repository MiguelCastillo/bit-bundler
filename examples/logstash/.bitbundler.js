var loggers = require("bit-bundler/loggers");
var loaderFilter = require("bit-bundler/loggers/loaderFilter");
var JSONStream = require("JSONStream");

module.exports = {
  log: loggers.sequence(loaderFilter(), JSONStream.stringify(false), process.stdout),
  src: "src/main.js",
  dest: "dist/out.js"
};
