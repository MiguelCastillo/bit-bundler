var Bitbundler = require("bit-bundler");
var jsPlugin = require("bit-loader-js");
var eslintPlugin = require("bit-loader-eslint");

var bitloader = new Bitbundler({
  watch: true,
  loader: {
    plugins: [
      jsPlugin(),
      eslintPlugin()
    ]
  }
});

bitloader
  .bundle({
    src: "src/main.js",
    dest: "dest/eslint-build.js"
  });
