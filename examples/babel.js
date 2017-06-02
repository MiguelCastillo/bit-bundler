var Bitbundler = require("bit-bundler");
var jsPlugin = require("bit-loader-js");
var babelPlugin = require("bit-loader-babel");

var bitbundler = new Bitbundler({
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
