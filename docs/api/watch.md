## Bitbundler.watch(context, options) : Context

Static method for setting up file watching capabilities. This is internally used by `bit-bundler` when you enable watching via the `watch` flag. This is exposed for convenience purposes if you want to venture out with your own setup.

* The context is what the call to [bundle](#bundlefiles--promise) generates.
* The options is an object with settings for [chokidar](https://github.com/paulmillr/chokidar). Default values are to not follow symlinks with `followSymlinks` set to false. It also ignores dot files and the `node_modules` directory via the `ignored` option. Please feel free pass in your own settings.

Vanilla setup.

``` javascript
var Bitbundler = require("bit-bundler");

Bitbundler
  .bundle({
    src: ["path/to/file.js"],
    dest: "output/bundle.js"
  })
  .then(Bitloader.watch);
```

Setup with options for [chokidar](https://github.com/paulmillr/chokidar).

``` javascript
var Bitbundler = require("bit-bundler");

Bitbundler
  .bundle({
    src: ["path/to/file.js"],
    dest: "output/bundle.js"
  })
  .then(function(context) {
    return Bitloader.watch(context, {
      followSymlinks: true
    });
  });
```
