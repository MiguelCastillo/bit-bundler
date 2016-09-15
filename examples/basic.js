var Bitbundler = require("bit-bundler");
var buildstats = require("bit-bundler/loggers/buildstats");

var bitbundler = new Bitbundler({
  log: buildstats()
});

bitbundler
  .bundle({
    src: "src/main.js",
    dest: "dest/basic.js"
  });
