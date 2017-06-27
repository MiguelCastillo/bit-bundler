var Bitbundler = require("bit-bundler");
var splitBundle = require("bit-bundler-splitter");
var buildstatsLogger = require("bit-bundler/loggers/buildstats");
var watchLogger = require("bit-bundler/loggers/watch");

var logger = watchLogger();
logger.pipe(buildstatsLogger());

var bitbundler = new Bitbundler({
  log: logger,
  loader: [
    "bit-loader-js",
    "bit-loader-babel"
  ],
  bundler: [
    splitBundle("renderer", { match: { path: /src\/renderer/ }, dest: "dest/renderer.js" }),
    splitBundle("other.js", { match: { fileName: "other.js" }, dest: "dest/other.js" })
  ],

  // Enable watching. You can alternatively pass
  // in an object with options for the file watcher
  watch: true
});

bitbundler.bundle({
  src: "src/main.js",
  dest: "dest/main.js"
});
