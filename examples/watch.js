var jsPlugin = require("bit-loader-js");
var babel = require("babel-bits");
var splitBundle = require("bit-bundler-splitter");
var Bitbundler = require("bit-bundler");

Bitbundler.bundle({
    src: "src/main.js",
    dest: "dest/watch-main.js"
  }, {
  watch: true,
  loader: {
    log: "error",
    plugins: jsPlugin({
      transform: babel
    })
  },
  bundler: {
    plugins: [
      // splitBundle("dest/watch-vendor.js"),
      splitBundle("dest/watch-renderer.js", { match: { path: /src\/renderer/ } })
    ]
  }
})
.then(function() {
  console.log("watch bundle complete.");
}, function(err) {
  console.error(err && err.stack ? err.stack : err);
});
