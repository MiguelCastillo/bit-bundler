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
    splitBundle("dest/watch-renderer.js", { match: { path: /src\/renderer/ } }),
    splitBundle("dest/watch-other.js", { match: { fileName: "other.js" } })
  ],
  watch: true
});

bitbundler
  .bundle({
    src: "src/main.js",
    dest: "dest/watch-main.js"
  });
