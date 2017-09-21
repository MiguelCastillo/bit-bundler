var loggers = require("bit-bundler/loggers");
var loaderLogger = require("bit-bundler/loggers/loader");
var JSONStream = require("JSONStream");

module.exports = {
  log: loggers.sequence(loaderLogger(), JSONStream.stringify(false), process.stdout),
  src: "src/main.js",
  dest: "dest/out.js"
};
