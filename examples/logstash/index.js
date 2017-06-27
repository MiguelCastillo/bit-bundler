var Bitbundler = require("bit-bundler");
var loaderLogger = require("bit-bundler/loggers/loader");
var JSONStream = require("JSONStream");

var logger = loaderLogger();
logger
  .pipe(JSONStream.stringify(false))
  .pipe(process.stdout);

var bitbundler = new Bitbundler({
  log: logger,
  loader: [
    "bit-loader-js"
  ]
});

bitbundler.bundle({
  src: "src/main.js",
  dest: "dest/out.js"
});
