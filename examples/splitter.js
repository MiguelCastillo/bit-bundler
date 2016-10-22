var Bitbundler = require("bit-bundler");
var jsPlugin = require("bit-loader-js");
var babelPlugin = require("bit-loader-babel");
var splitBundle = require("bit-bundler-splitter");

var bitbundler = new Bitbundler({
  loader: {
    plugins: [
      jsPlugin(),
      babelPlugin()
    ]
  },
  bundler: {
    plugins: [
      splitBundle("dest/splitter-vendor.js", { match: { path: /\/node_modules\// } }),
      splitBundle("dest/splitter-renderer.js", { match: { path: /src\/renderer/ } })
    ]
  }
});

bitbundler
  .bundle({
    src: "src/main.js",
    dest: "dest/splitter-main.js"
  });
