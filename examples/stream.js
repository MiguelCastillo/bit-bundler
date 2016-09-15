var Bitbundler = require("bit-bundler");
var jsPlugin = require("bit-loader-js");
var JSONStream = require("JSONStream");

var logger = JSONStream.stringify(false);
logger.pipe(process.stdout);

var bitbundler = new Bitbundler({
  log: logger,
  loader: {
    plugins: jsPlugin()
  }
});

bitbundler
  .bundle({
    src: "src/main.js",
    dest: "dest/jsplugin.js"
  })
  .then(function() {
    console.log("jsplugin bundle complete");
  }, function(err) {
    console.log(err && err.stack ? err.stack : err);
  });
