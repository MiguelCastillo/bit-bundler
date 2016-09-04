var Bitbundler = require("bit-bundler");
var jsPlugin = require("bit-loader-js");
var JSONStream = require("JSONStream");

var logStream = JSONStream.stringify(false);
logStream.pipe(process.stdout);

var bitbundler = new Bitbundler({
  log: {
    stream: logStream
  },
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
