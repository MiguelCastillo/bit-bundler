var Bitbundler = require("bit-bundler");
var buildstats = require("bit-bundler/loggers/buildstats");
var jsPlugin = require("bit-loader-js");
var eslintPlugin = require("bit-eslint");

var bitloader = new Bitbundler({
  watch: true,
  log: buildstats(),
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
