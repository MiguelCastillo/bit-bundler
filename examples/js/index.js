var Bitbundler = require("bit-bundler");

var bitbundler = new Bitbundler({
  loader: [
    "bit-loader-js"
  ]
});

bitbundler.bundle({
  src: "src/main.js",
  dest: "dest/out.js"
});
