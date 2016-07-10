var Bitbundler = require("bit-bundler");
var bitbundler = new Bitbundler();

bitbundler
  .bundle({
    src: "src/main.js",
    dest: "dest/basic.js"
  })
  .then(function() {
    console.log("basic bundle complete");
  }, function(err) {
    console.log(err && err.stack ? err.stack : err);
  });
