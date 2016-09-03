var jsPlugin = require("bit-loader-js");
var babel = require("babel-bits");
var splitBundle = require("bit-bundler-splitter");
var Bitbundler = require("bit-bundler");
var buildstatsStream = require("bit-bundler/streams/buildstats");

var bitbundler = new Bitbundler({
  log: {
    stream: buildstatsStream()
  },
  loader: {
    plugins: jsPlugin({
      transform: babel
    })
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
  }, function(err) {
    console.error(err && err.stack ? err.stack : err);
  });
