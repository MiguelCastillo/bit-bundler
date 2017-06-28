## Tech Summary

`bit-bundler` uses [bit-loader](https://github.com/MiguelCastillo/bit-loader) as module loading system. With `bit-loader`'s configurable pipeline for loading and processing modules you can configure how modules are loaded, transformed, and how dependencies are processed. The output from `bit-loader` is a module graph wrapped in a `context` that is passed on to the bundler. By default, the bit-bundler uses [js bundler](https://github.com/MiguelCastillo/bit-bundler-browserpack) to create bundles, which is a wapper for browserpack.

> bit-bundler uses [node-browser-resolve](https://github.com/defunctzombie/node-browser-resolve) to support [node module resolution](https://nodejs.org/api/modules.html#modules_all_together). However, bit-bundler does not speak CJS (`require` statements) out of the box. But... For this, you can use [bit-loader-js](https://github.com/MiguelCastillo/bit-loader-js).

The way that `bit-bundler` works is simple. The files to be bundled are handed off to `bit-loader`. `bit-loader` loads these files from disk, applies any transforms, and *recursively* loads and processes all module dependencies. The output of this is a dependecy graph. The pipeline that does all this work can be configured via plugins, which are relatively simple to create.

`bit-bundler` then creates a `context`, which has the dependency graph created by `bit-loader`. This `context` is passed to the [bundler](https://github.com/MiguelCastillo/bit-bundler-browserpack) in order to conver the dependecy graph into an actual bundle.

What you write to disk is generally `context.bundle.result`. You also write to disk `context.shards`, if you are using bundler plugins such as [bit-bundler-splitter](https://github.com/MiguelCastillo/bit-bundler-splitter) that can split up `context.bundle`.
