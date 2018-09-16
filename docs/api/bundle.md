## Bitbundler.bundle(files, options) : Promise

Static method to bundle your files with the provided options. This is an alternative to needing to first create an instance of bit-bundler and then calling the bundle method on the instance.

* The files use the same format as the `bundle` method. Please see the [bundle](Bitbundler.md#bundlefiles--promise) method.
* The options are the same as the constructor. Please see [Bitbundler's constructor](Bitbundler.md#bitbundleroptions--bitbundler).

``` javascript
var Bitbundler = require("@bit/bundler");

Bitbundler.bundle({
  src: ["path/to/file.js"],
  dest: "output/bundle.js"
}, {
  watch: true
});
```
