var jsPlugin = require("bit-loader-js");
var Bitbundler = require("bit-bundler");

var bitbundler = new Bitbundler({
  loader: {
    plugins: jsPlugin()
  }
});

bitbundler
  .bundle("src/main.js")
  .then(Bitbundler.dest("dest/jsplugin.js"))
  .then(function() {
    console.log("jsplugin bundle complete");
  }, function(err) {
    console.log(err);
  });
