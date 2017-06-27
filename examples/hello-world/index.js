var Bitbundler = require("bit-bundler");

var bitbundler = new Bitbundler();

bitbundler.bundle({
  src: "src/main.js",
  dest: "dest/out.js"
});
