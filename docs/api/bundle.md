## Bitbundler.bundle(files, options) : Promise

Static factory method to create an instance of `bit-bundler` with the provided options and bundles the input files.

* The files use the same format as the `bundle` method. Please see the [bundle](#bundlefiles--promise) method.
* The options are the same as the constructor. Please see [Bitbundler's constructor](#bitbundleroptions--bitbundler).

``` javascript
var Bitbundler = require("bit-bundler");

Bitbundler
  .bundle({
    src: ["path/to/file.js"],
    dest: "output/bundle.js"
  }, {
    watch: true
  });
```