var jsPlugin = require("bit-loader-js");
var babel = require("babel-bits");
var splitBundle = require("bit-bundler-splitter");
var Bitbundler = require("bit-bundler");

var bitbundler = new Bitbundler({
  loader: {
    plugins: jsPlugin({
      transform: babel
    })
  },
  bundler: {
    plugins: [
      splitBundle("dest/vendor.js"),
      splitBundle("dest/renderer.js", { match: { path: /src\/renderer/ } })
    ]
  }
});

bitbundler
  .bundle("src/main.js")
  .then(Bitbundler.dest("dest/splitter.js"))
  .then(function() {
    console.log("splitter bundle complete");
  }, function(err) {
    console.log(err && err.stack ? err.stack : err);
  });
