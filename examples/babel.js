var Bitbundler = require("bit-bundler");

var bitbundler = new Bitbundler({
  multiprocess: true,
  loader: [
    "bit-loader-js",
    ["bit-loader-babel", {
      options: {
        presets: ["es2015"],
        sourceMap: "inline"
      }
    }]
  ]
});

bitbundler
  .bundle({
    src: "src/main.js",
    dest: "dest/babel.js"
  });
