## Tech Summary

`bit-bundler` uses [bit-loader](https://github.com/MiguelCastillo/bit-loader) as module loading system. With `bit-loader`'s configurable pipeline for loading and processing modules you can configure how modules are loaded, transformed, and how dependencies are processed. The output from `bit-loader` is a module graph wrapped in a `context` that is passed on to the bundler.

> By default, the bit-bundler uses [js bundler](https://github.com/MiguelCastillo/bit-bundler-browserpack) to create bundles, which is a wapper for browserpack.

> bit-bundler uses [node-browser-resolve](https://github.com/defunctzombie/node-browser-resolve) to support [node module resolution aka nmr](https://nodejs.org/api/modules.html#modules_all_together).

The way that `bit-bundler` works is simple. The files to be bundled are handed off to `bit-loader`. `bit-loader` loads these files from storage, applies any transforms, and *recursively* loads and processes all module dependencies. The output of this stage is a dependecy graph. The pipeline that does all this work can be configured via plugins, which are relatively simple to create.

`bit-bundler` has an internal context, which keeps track of the current state of the bundling process. This `context` is populated with the dependency graph created by `bit-loader` and subsequently passed to the [bundler](https://github.com/MiguelCastillo/bit-bundler-browserpack). The bundler converts the dependecy graph into an actual bundle that can be written to disk.

What you write to disk is generally `context.bundle.content`. You also write to disk `context.shards`, if you are using bundler plugins such as [bit-bundler-splitter](https://github.com/MiguelCastillo/bit-bundler-splitter) that can split up `context.bundle`.
