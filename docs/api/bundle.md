## Bitbundler.bundle(files, options) : Promise

Factory method to create an instance of `bit-bundler`. Specify files to bundle as the first argument and options as the second argument. You can alternatively pass in an object with a key `contents`, which is bundled.

* The files use the same format as the `bundle` method. Please see the [bundle](Bitbundler.md#bundlefiles--promise) method.
* The options are the same as the constructor. Please see [Bitbundler's constructor](Bitbundler.md#bitbundleroptions--bitbundler).

``` javascript
var Bitbundler = require("bit-bundler");

Bitbundler.bundle({
  src: ["path/to/file.js"],
  dest: "output/bundle.js"
}, {
  watch: true
});
```
