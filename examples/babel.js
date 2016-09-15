var Bitbundler = require("bit-bundler");
var buildstats = require("bit-bundler/loggers/buildstats");
var jsPlugin = require("bit-loader-js");
var babelPlugin = require("bit-loader-babel");

var bitbundler = new Bitbundler({
  log: buildstats(),
  loader: {
    plugins: [
      jsPlugin(),
      babelPlugin({
        options: {
          presets: ["es2015"],
          sourceMap: "inline"
        }
      })
    ]
  }
});

bitbundler
  .bundle({
    src: "src/main.js",
    dest: "dest/babel.js"
  });
