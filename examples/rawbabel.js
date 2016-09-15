var Bitbundler = require("bit-bundler");
var buildstats = require("bit-bundler/loggers/buildstats");
var jsPlugin = require("bit-loader-js");
var babel = require("babel-core");

var bitbundler = new Bitbundler({
  log: buildstats(),
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
  .bundle({
    src: "src/main.js",
    dest: "dest/rawbabel.js"
  });
