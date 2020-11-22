var loggers = require("@bit/bundler/loggers");
var verboseLogger = require("@bit/bundler/loggers/verbose");
var loaderFilter = require("@bit/bundler/loggers/loaderFilter");

module.exports = {
  log: loggers.sequence(loaderFilter(), verboseLogger()),
  src: "src/main.js",
  dest: "dist/main.js",

  loader: [
    "@bit/loader-babel"
  ]
};
