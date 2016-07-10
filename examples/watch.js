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
    plugins: jsPlugin({
      transform: babel
    })
  },
  bundler: {
    plugins: [
      splitBundle("dest/watch-other.js", { match: { fileName: "other.js" } }),
      splitBundle("dest/watch-renderer.js", { match: { path: /src\/renderer/ } })
    ]
  }
})
.then(function() {
  console.log("watch bundle complete.");
}, function(err) {
  console.error(err && err.stack ? err.stack : err);
});
