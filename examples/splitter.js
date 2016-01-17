var jsPlugin = require('bit-loader-js');
var babel = require('babel-bits');
var splitBundle = require('bit-bundler-splitter');
var Bitbundler = require('bit-bundler');

var bitbundler = new Bitbundler({
  loader: {
    plugins: jsPlugin({
      transform: babel
    })
  },
  bundler: {
    plugins: [
      splitBundle('out/vendor.js'),
      splitBundle('out/renderer.js', { match: { path: /src\/renderer/ } })
    ]
  }
});

bitbundler
  .bundle('./src/main.js')
  .then(function(context) {
    console.log(context.bundle);
    console.log(context.parts);
  }, function(err) {
    console.log(err);
  });
