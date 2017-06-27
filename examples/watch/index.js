var Bitbundler = require("bit-bundler");
var loggers = require("bit-bundler/loggers");
var buildstatsLogger = require("bit-bundler/loggers/buildstats");
var watchLogger = require("bit-bundler/loggers/watch");

var bitbundler = new Bitbundler({
  log: loggers.sequence(watchLogger(), buildstatsLogger()),
  loader: [
    "bit-loader-js"
  ],

  // Enable watching. You can alternatively pass
  // in an object with options for the file watcher
  watch: true
});

bitbundler.bundle({
  src: "src/main.js",
  dest: "dest/main.js"
});
