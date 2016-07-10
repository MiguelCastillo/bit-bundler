<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
## Table of Contents

- [Most basic example](#most-basic-example)
- [Bundle JavaScript with node.js dependencies](#bundle-javascript-with-nodejs-dependencies)
- [Bundle JavaScript and transform it with Babel??](#bundle-javascript-and-transform-it-with-babel)
- [How about splitting bundles??](#how-about-splitting-bundles)
- [Some file watching, please!](#some-file-watching-please!)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

These are some examples/recipes to get you started with. These examples cover concepts that range from the most basic setup to a more advanced setup where bundles are split.

You can certainly run these examples too.

```
$ npm install
$ node basic
$ node jsplugin
```

#### Most basic example

that loads `src/main.js` and bundles it.

Setup:
``` javascript
var Bitbundler = require("bit-bundler");
var bitbundler = new Bitbundler();

bitbundler
  .bundle({
    src: "src/main.js",
    dest: "dest/basic.js"
  })
  .then(function() {
    console.log("basic bundle complete");
  }, function(err) {
    console.log(err && err.stack ? err.stack : err);
  });
```

Run:
```
$ node basic
```

#### Bundle JavaScript with node.js dependencies

By default, `bit-bundler` does not understand how to process module dependencies.  So we will rely on [bit-loader-js](https://github.com/MiguelCastillo/bit-loader-js) to help us out here.

> Note: Running this example will fail because the example is written with ES2015 features, so it requires transpiling. We illustrate how to configure [babel](http://babeljs.io/) a little later to tie this whole thing together.

Setup:
``` javascript
var jsPlugin = require("bit-loader-js");
var Bitbundler = require("bit-bundler");

var bitbundler = new Bitbundler({
  loader: {
    plugins: jsPlugin()
  }
});

bitbundler
  .bundle({
    src: "src/main.js",
    dest: "dest/jsplugin.js"
  })
  .then(function() {
    console.log("jsplugin bundle complete");
  }, function(err) {
    console.log(err && err.stack ? err.stack : err);
  });
```

Run:
```
$ node jsplugin
```

#### Bundle JavaScript and transform it with Babel??

Yes please! This setup relies on a helper module called [babel-bits](https://github.com/MiguelCastillo/babel-bits).

Setup:
``` javascript
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
```

Run:
```
$ node babel
```


#### How about splitting bundles??

Yup, use the bundler plugin [bit-bundler-splitter](https://github.com/MiguelCastillo/bit-bundler-splitter) to help us here.

> You can configure multiple bundle splitters with matching rules to generate multiple bundles.

Setup:
``` javascript
var jsPlugin = require("bit-loader-js");
var babel = require("babel-bits");
var splitBundle = require("bit-bundler-splitter");
var Bitbundler = require("bit-bundler");

var bitbundler = new Bitbundler({
  loader: {
    plugins: jsPlugin({
      transform: babel
    })
  },
  bundler: {
    plugins: [
      splitBundle("dest/vendor.js"),
      splitBundle("dest/renderer.js", { match: { path: /src\/renderer/ } })
    ]
  }
});

bitbundler
  .bundle({
    src: "src/main.js",
    dest: "dest/splitter.js"
  })
  .then(function() {
    console.log("splitter bundle complete");
  }, function(err) {
    console.log(err && err.stack ? err.stack : err);
  });
```

Run:
```
$ node splitter
```


#### Some file watching, please!

Probably the most common setup would be to include file watching functionality. This setup is pretty much the same as the splitter example, but it just passed `watch: true` to enable file watching.

Setup:
``` javascript
var jsPlugin = require("bit-loader-js");
var babel = require("babel-bits");
var splitBundle = require("bit-bundler-splitter");
var Bitbundler = require("bit-bundler");

var bitbundler = new Bitbundler({
  loader: {
    plugins: jsPlugin({
      transform: babel
    })
  },
  bundler: {
    plugins: [
      splitBundle("dest/watch-renderer.js", { match: { path: /src\/renderer/ } }),
      splitBundle("dest/watch-other.js", { match: { fileName: "other.js" } })
    ]
  },
  watch: true
});

bitbundler
  .bundle({
    src: "src/main.js",
    dest: "dest/watch-main.js"
  })
  .then(function() {
    console.log("watch bundle complete.");
  }, function(err) {
    console.error(err && err.stack ? err.stack : err);
  });
```

Run:
```
$ node watch
```
