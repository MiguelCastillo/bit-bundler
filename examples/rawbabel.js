var jsPlugin = require("bit-loader-js");
var babel = require("babel-core");
var Bitbundler = require("bit-bundler");

var bitbundler = new Bitbundler({
  loader: {
    plugins: jsPlugin({
      transform: function(meta) {
        var transpiled = babel.transform(meta.source, {
          presets: ["es2015"]
        });

        return {
          source: transpiled.code
        };
      }
    })
  }
});

bitbundler
  .bundle("src/main.js")
  .then(Bitbundler.dest("dest/rawbabel.js"))
  .then(function() {
    console.log("babel bundle complete");
  }, function(err) {
    console.log(err && err.stack ? err.stack : err);
  });
