var Bitbundler = require("bit-bundler");

var bitbundler = new Bitbundler({
  multiprocess: true,
  loader: [
    "bit-loader-js",
    "bit-loader-babel"
  ]
});

bitbundler.bundle({
  src: "src/main.js",
  dest: "dest/out.js"
});
