## Tech Summary

bit-bundler uses [bit-loader](https://github.com/MiguelCastillo/bit-loader) as module loading system. With bit-loader's configurable pipeline for loading and processing modules you can configure how modules are loaded, transformed, and how dependencies are processed. The output from bit-loader is a module graph wrapped in a `context` that is passed on to the bundler.

The way that bit-bundler works is simple. The files to be bundled are handed off to bit-loader. bit-loader loads these files from storage, applies any transforms, and *recursively* loads and processes all module dependencies. The output of this stage is a dependecy graph. The pipeline that does all this work can be configured via plugins, which are relatively simple to create.

bit-bundler has an internal context, which keeps track of the current state of the bundling process. This `context` is populated with the dependency graph created by bit-loader and subsequently passed to the bundler. The bundler converts the dependecy graph into an actual bundle that can be written to disk.

What you write to disk is generally the content in `context.shards`, which can be more than one bundle if you are using a plugin like [bit-bundler-splitter](https://github.com/MiguelCastillo/bit-bundler-splitter) for bundle splitting.
