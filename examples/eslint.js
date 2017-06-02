var Bitbundler = require("bit-bundler");

var bitloader = new Bitbundler({
  watch: true,
  loader: [
    "bit-loader-js",
    "bit-loader-eslint"
  ]
});

bitloader
  .bundle({
    src: "src/main.js",
    dest: "dest/eslint-build.js"
  });
