var Bitbundler = require("bit-bundler");
var loaderStream = require("bit-bundler/streams/loader");
var jsPlugin = require("bit-loader-js");
var JSONStream = require("JSONStream");

var logStream = loaderStream();
logStream
  .pipe(JSONStream.stringify(false))
  .pipe(process.stdout);

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
  .then(function() {}, function(err) {
    console.log(err && err.stack ? err.stack : err);
  });
