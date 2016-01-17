var jsPlugin = require('bit-loader-js');
var babel = require('babel-bits');
var Bitbundler = require('bit-bundler');

var bitbundler = new Bitbundler({
  loader: {
    plugins: jsPlugin({
      transform: babel.config({
        options: {
          presets: ['es2015']
        }
      })
    })
  }
});

bitbundler
  .bundle('./src/main.js')
  .then(function(context) {
    console.log(context.bundle);
  }, function(err) {
    console.log(err);
  });
