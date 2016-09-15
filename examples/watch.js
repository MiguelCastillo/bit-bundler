var jsPlugin = require("bit-loader-js");
var babelPlugin = require("bit-loader-babel");
var splitBundle = require("bit-bundler-splitter");
var Bitbundler = require("bit-bundler");
var buildstatsLogger = require("bit-bundler/loggers/buildstats");
var warningsLogger = require("bit-bundler/loggers/warnings");
var watchLogger = require("bit-bundler/loggers/watch");

var logger = watchLogger();
logger.pipe(buildstatsLogger()).pipe(warningsLogger());

var bitbundler = new Bitbundler({
  log: logger,
  loader: {
    plugins: [
      jsPlugin(),
      babelPlugin()
    ]
  },
  bundler: {
    plugins: [
      splitBundle("dest/watch-renderer.js", { match: { path: /src\/renderer/ } }),
      splitBundle("dest/watch-other.js", { match: { fileName: "other.js" } })
    ]
  },
  watch: true
});

bitbundler
  .bundle({
    src: "src/main.js",
    dest: "dest/watch-main.js"
  })
  .then(function() {
    console.log("watch bundle complete.");
  });
