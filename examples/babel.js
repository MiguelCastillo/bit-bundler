var jsPlugin = require("bit-loader-js");
var babelPlugin = require("bit-loader-babel");
var Bitbundler = require("bit-bundler");

var bitbundler = new Bitbundler({
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
  })
  .then(function() {
    console.log("babel bundle complete");
  }, function(err) {
    console.log(err && err.stack ? err.stack : err);
  });
