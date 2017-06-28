var Bitbundler = require("bit-bundler");
var loggers = require("bit-bundler/loggers");
var verboseLogger = require("bit-bundler/loggers/verbose");
var loaderFilter = require("bit-bundler/loggers/loaderFilter");

var bitbundler = new Bitbundler({
  log: loggers.sequence(loaderFilter(), verboseLogger()),
  loader: [
    "bit-loader-js"
  ]
});

bitbundler.bundle({
  src: "src/main.js",
  dest: "dest/main.js"
});
