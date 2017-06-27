var Bitbundler = require("bit-bundler");

var bitloader = new Bitbundler({
  loader: [
    "bit-loader-js",
    "bit-loader-eslint"
  ]
});

bitloader.bundle({
  src: "src/main.js",
  dest: "dest/out.js"
});
