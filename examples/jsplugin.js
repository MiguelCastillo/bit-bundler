var jsPlugin = require('bit-loader-js');
var Bitbundler = require('bit-bundler');

var bitbundler = new Bitbundler({
  loader: {
    plugins: jsPlugin()
  }
});

bitbundler
  .bundle('./src/main.js')
  .then(function(context) {
    console.log(context.bundle);
  }, function(err) {
    console.log(err);
  });
