var Bitbundler = require('bit-bundler');
var bitbundler = new Bitbundler();

bitbundler
  .bundle('./src/main.js')
  .then(function(context) {
    console.log(context.bundle);
  }, function(err) {
    console.log(err);
  });
