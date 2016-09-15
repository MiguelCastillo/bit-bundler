var jsPlugin = require("bit-loader-js");
var babelPlugin = require("bit-loader-babel");
var splitBundle = require("bit-bundler-splitter");
var Bitbundler = require("bit-bundler");
var buildstats = require("bit-bundler/loggers/buildstats");

var bitbundler = new Bitbundler({
  log: buildstats(),
  loader: {
    plugins: [
      jsPlugin(),
      babelPlugin()
    ]
  },
  bundler: {
    plugins: [
      splitBundle("dest/dest-renderer.js", { match: { path: /src\/renderer/ } }),
      splitBundle("dest/dest-other.js", { match: { fileName: "other.js" } })
    ]
  }
});

bitbundler
  .bundle("src/main.js")
  .then(Bitbundler.dest("dest/dest-main.js"))
  .then(function() {
    console.log("dest bundle complete.");
  }, function(err) {
    console.error(err && err.stack ? err.stack : err);
  });
