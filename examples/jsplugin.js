var Bitbundler = require("bit-bundler");
var buildstats = require("bit-bundler/loggers/buildstats");
var jsPlugin = require("bit-loader-js");

var bitbundler = new Bitbundler({
  log: buildstats(),
  loader: {
    plugins: jsPlugin()
  }
});

bitbundler
  .bundle({
    src: "src/main.js",
    dest: "dest/jsplugin.js"
  });
