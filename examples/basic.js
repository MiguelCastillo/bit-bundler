var Bitbundler = require("bit-bundler");
var bitbundler = new Bitbundler({
  multiprocess: true
});

bitbundler
  .bundle({
    src: "src/main.js",
    dest: "dest/basic.js"
  });
