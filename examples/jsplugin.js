var Bitbundler = require("bit-bundler");
var jsPlugin = require("bit-loader-js");

var bitbundler = new Bitbundler({
  loader: {
    plugins: jsPlugin()
  }
});

bitbundler
  .bundle({
    src: "src/main.js",
    dest: "dest/jsplugin.js"
  });
