<img src="img/bit-bundler_white.png" width="100%"></img>

# bit-bundler
> Pluggable bundler that generates bundles for the browser.


### Install

```
$ npm install --save-dev bit-bundler
```


### Options and settings.

#### Bitbundler(options) : bitbundler

Constructor that creates an instance of `bit-bundler`.  Valid options are:

- **`options.loader`** { object } - Options to be passed on to the module loader.
  - **`plugins`** { Array[Plugin] | Plugin } - Plugins to be registerer with the module loader. These plugins are for procesing modules before they are bundled.
  - **`ignoreNotFound`** { boolean } (false) - Flag to ignore modules not found on disk. When set to true, these modules will just be empty entries in the bundle.
  - **`log`** { string } (error) - Log level. By default only errors are logged. Valid values are `'info'`, `'warn'`, `'error'`, and `false`.

- **`options.bundler`** { object } - Options to be passed on to the bundler.
  - **`plugins`** { Array[Plugin] | Plugin } - Plugins to be registered with the bundler. These plugins are for processing the module graph in order to create and manipulate bundles.
  - **`printInfo`** { boolean } (false) - Flag to print to console basic information about the modules in bundles.
  - **`filePathAsId`** { boolean } (false) - Flag to tell the bundler to use modules' full path as ids instead of numeric values when generating bundles.
  - **`provider`** { { function: bundle } } - Option for defining a custom bundler to process the module graph. By default, this is set to [js bundler](https://github.com/MiguelCastillo/bit-bundler-browserpack). But you can override this if you would like to provide a custom way of generating bundles.


#### Bitbundler.dest(destination) : Function

Static method that creates bundle writers. Bundle writers handle writing bundle parts as well.

- **`destination`** { function | string } - Destination can be a `string`, in which case the internal stream factory creates a file stream to write bundles to. If `destination` is a `function`, it is called. If the call returns a `string`, then the internal stream factory creates a file stream with it, otherwise the bundle writer will expect a stream and will use that. Use a `function` if you need to create custom streams to write bundles to.


#### bundle(files) : Promise

Method to bundle a list of files. Calling this method returns a promise that when resolved returns a context with the bundle along with information about it.

- **`files`** { Array[string] | string } - Files to be bundled.

The context is generated with the following information:

- **`bundle`** { {string: result} } - Object with a string property called `result`, which is the actual string to be written to disk.
- **`cache`** { object } - Map of modules by module `id`.
- **`exclude`** { Array[string] } - Array of module `ids` to exclude from `bundle`. TODO: [Allow matching more than module ids](https://github.com/MiguelCastillo/bit-bundler/issues/47)
- **`modules`** { Array[object] } - Array of root nodes (modules) of the module graph. These root nodes have an `id` that are used as keys into `cache` to get full module objects.
- **`parts`** { object } - Map of bundle parts pulled out of the main `bundle` in the context. This map will have items created by plugins like [bundle splitter](https://github.com/MiguelCastillo/bit-bundler-splitter) that can extract modules and generate separate bundles.

---

### Integrations

- [grunt](https://github.com/MiguelCastillo/grunt-bit-bundler)
- gulp: TODO


### Examples

For more, please see [examples](https://github.com/MiguelCastillo/bit-bundler/tree/master/examples)

#### Bundle JavaScript with node.js dependencies

By default, `bit-bundler` does not understand how to process module dependencies.  So we will rely on [bit-loader-js](https://github.com/MiguelCastillo/bit-loader-js) to help us out here.

``` javascript
var jsPlugin = require('bit-loader-js');
var Bitbundler = require('bit-bundler');

var bitbundler = new Bitbundler({
  loader: {
    plugins: jsPlugin()
  }
});

bitbundler
  .bundle('src/main.js')
  .then(Bitbundler.dest('dest/main.js'))
  .then(function() {
    console.log('Bundle finished');
  });
```


### Why this project?

The rationale behind this project is to provide a configurable and flexible bundling system that makes it really simple to *generate and split bundles*.


### Tech summary

`bit-bundler` uses [bit-loader](https://github.com/MiguelCastillo/bit-loader) as module loading system. With `bit-loader`'s configurable pipeline for loading and processing modules you can configure how modules are loaded, transformed, and how dependencies are processed. The output from `bit-loader` is a module graph wrapped in a `context` that is pushed on to the configured bundler provider. By default, the bundler provider is this [js bundler](https://github.com/MiguelCastillo/bit-bundler-browserpack).

> bit-bundler uses [node-browser-resolve](https://github.com/defunctzombie/node-browser-resolve) to provide NPM module resolution out of the box.  However, bit-bundler does not support CJS (`require` statements) out of the box. But... For this, you can use [bit-loader-js](https://github.com/MiguelCastillo/bit-loader-js).


### Processing flow

The way that `bit-bundler` works is simple. The files to be bundled are handed off to `bit-loader`. `bit-loader` loads these files from disk, applies any transforms, and *recursively* loads and processes all module dependencies. The output of this is a module graph. The pipeline that does all this work can be configured via plugins, which are relatively simple to create; no streams! The settings for `bit-loader` step are the `loader` options passed in to the `bit-bundler` constructor.

`bit-bundler` then creates a `context`, which has the module graph created by `bit-loader`. The `context` also has a `cache`, which is a flattened map of the module graph with the module `ids` as the keys.  This `context` is passed to the bundler `provider`, which by default is this [js bundler](https://github.com/MiguelCastillo/bit-bundler-browserpack) but you can certainly create your own bundlers. What you get at the end is the `context` with the `bundle` as well other information that's generally of interest if you are looking to do any further processing on the generated `bundle`.

What you write to disk is generally `context.bundle.result`. You also write to disk `context.parts`, if you are using bundler plugins such as [bit-bundler-splitter](https://github.com/MiguelCastillo/bit-bundler-splitter) that can split up `context.bundle`.


### License

Licensed under MIT
