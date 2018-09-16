var loggers = require("@bit/bundler/loggers");
var buildstatsLogger = require("@bit/bundler/loggers/buildstats");
var watchLogger = require("@bit/bundler/loggers/watch");

module.exports = {
  // Enable watching. You can alternatively pass
  // in an object with options for the file watcher
  watch: true,

  log: loggers.sequence(watchLogger(), buildstatsLogger()),
  src: "src/main.js",
  dest: "dist/main.js"
};
