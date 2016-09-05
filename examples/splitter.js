var jsPlugin = require("bit-loader-js");
var babelPlugin = require("bit-loader-babel");
var splitBundle = require("bit-bundler-splitter");
var Bitbundler = require("bit-bundler");

var bitbundler = new Bitbundler({
  loader: {
    plugins: [
      jsPlugin(),
      babelPlugin()
    ]
  },
  bundler: {
    plugins: [
      splitBundle("dest/vendor.js"),
      splitBundle("dest/renderer.js", { match: { path: /src\/renderer/ } })
    ]
  }
});

bitbundler
  .bundle({
    src: "src/main.js",
    dest: "dest/splitter.js"
  })
  .then(function() {
    console.log("splitter bundle complete");
  }, function(err) {
    console.log(err && err.stack ? err.stack : err);
  });
