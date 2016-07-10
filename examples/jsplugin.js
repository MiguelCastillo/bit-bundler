var jsPlugin = require("bit-loader-js");
var Bitbundler = require("bit-bundler");

var bitbundler = new Bitbundler({
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
