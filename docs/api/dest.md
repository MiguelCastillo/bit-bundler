## Bitbundler.dest(destination) : Function

Static method to define where to write bundles to. This will handle writing bundle shards as well. This is exposed for convenience purposes in case you want to hand roll your own setup. Otherwise, passing in `dest` to the [bundle](#bundlefiles--promise) method is the preferred approach because that is compatible with file watching.

> `Bitbundle.dest` is not compatible with file watching.

- **`destination`** { function | string | WritableStream } - `destination` can be a `string`, in which case the internal stream factory creates a file stream to write bundles to it. If `destination` is a `function`, it is called. If the call returns a `string`, then the internal stream factory creates a file stream with it, otherwise the bundle writer expects a writable stream. Use a `function` if you need to create custom streams to write bundles to.

``` javascript
var Bitbundler = require("bit-bundler");
var bitbundler = new Bitbundler();

bitbundler
  .bundle(["path/to/file.js"])
  .then(Bitbundler.dest("output/path/file.js"));
```
