var Bitbundler = require("bit-bundler");
var throughStream = require("bit-bundler/loggers/through");
var buildstatsLogger = require("bit-bundler/loggers/buildstats");
var watchLogger = require("bit-bundler/loggers/watch");

var logger = throughStream();
logger.pipe(watchLogger()).pipe(buildstatsLogger());

var bitbundler = new Bitbundler({
  log: logger,
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
