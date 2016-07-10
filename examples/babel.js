var jsPlugin = require("bit-loader-js");
var babel = require("babel-bits");
var Bitbundler = require("bit-bundler");

var bitbundler = new Bitbundler({
  loader: {
    plugins: jsPlugin({
      transform: babel.config({
        options: {
          presets: ["es2015"],
          sourceMap: "inline"
        }
      })
    })
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
