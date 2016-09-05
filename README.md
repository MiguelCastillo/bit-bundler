<img src="https://raw.githubusercontent.com/MiguelCastillo/bit-bundler/master/img/bit-bundler_white.png" width="100%"></img>

> Generate application bundles with ease.

But we already a bunch of bundlers out there... Why another one???  `bit-bundler` aims to simplify the process of generating application bundles with a fluid and intuitive API. The problem we are trying to solve is around setup complexity while providing a flexible environment that scales to meet more intricate requirements.


<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
## Table of Contents

- [Install](#install)
- [Example](#example)
- [API](#api)
  - [Bitbundler(options) : Bitbundler](#bitbundleroptions--bitbundler)
  - [bundle(files) : Promise](#bundlefiles--promise)
  - [Bitbundler.bundle(files, options) : Promise](#bitbundlerbundlefiles-options--promise)
  - [Bitbundler.dest(destination) : Function](#bitbundlerdestdestination--function)
  - [Bitbundler.watch(context, options) : Context](#bitbundlerwatchcontext-options--context)
- [Context](#context)
- [Loader Plugins](#loader-plugins)
- [Loader Transforms](#loader-transforms)
- [Bundler Plugins](#bundler-plugins)
- [Integrations](#integrations)
- [Tech summary](#tech-summary)
- [Processing flow](#processing-flow)
- [License](#license)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->


## Install

```
$ npm install --save-dev bit-bundler
```

## Example

The following example does a few things. It bundles JavaScript with node dependencies, transforms your assets with babel, creates multiple bundles, and watches for files changes.

> By default, `bit-bundler` does not understand how to process [node dependencies](https://nodejs.org/api/modules.html#modules_all_together).  So we will rely on [bit-loader-js](https://github.com/MiguelCastillo/bit-loader-js) to help us out here.

``` javascript
var babel = require("babel-bits");
var jsPlugin = require("bit-loader-js");
var splitBundle = require("bit-bundler-splitter");
var Bitbundler = require("bit-bundler");

var bitbundler = new Bitbundler({
  watch: true,
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

bitbundler.bundle({
  src: "src/main.js",
  dest: "dest/app.js"
});
```

Now just include the bundles in your HTML

``` html
<html>
  <head>
    <script type="text/javascript" src="./dest/vendor.js" defer></script>
    <script type="text/javascript" src="./dest/renderer.js" defer></script>
    <script type="text/javascript" src="./dest/app.js" defer></script>
  </head>

  <body></body>
</html>
```

Head over to [examples](https://github.com/MiguelCastillo/bit-bundler/tree/master/examples) for more setups.

## API

### Bitbundler(options) : Bitbundler

`bit-bundler` constructor.  Valid options are:

- **`log`** { string | boolean | object } (error) - By default only errors are logged. You can change the log level by specifying one of the following values `'info'`, `'warn'`, `'error'`, or completely disable it with `false`. You can futher customize logging by specifying an object with a stream to write log messages to. When you specify an object, logging level is changed to log *all* messages.
  - **`stream`** { Stream } - Writable stream to write log messages to. There are a couple of sample streams in the [streams directory](https://github.com/MiguelCastillo/bit-bundler/tree/master/streams).
  - **`level`** { string } - Log level to fine tune the types of messages that can be logged. Valid values are `'info'`, `'warn'`, `'error'`.

- **`loader`** { object } - Options to be passed on to the module loader.
  - **`plugins`** { Array[Plugin] | Plugin } - Plugins to be registerer with the module loader. These plugins are for procesing modules before they are bundled.
  - **`ignoreNotFound`** { boolean } (false) - Flag to ignore modules not found on disk. When set to true, these modules will just be empty entries in the bundle.

- **`bundler`** { object } - Options to be passed on to the bundler.
  - **`sourceMap`** { boolean } (true) - Enables/disables the generation of inline source maps.
  - **`plugins`** { Array[Plugin] | Plugin } - Plugins to be registered with the bundler. Plugins can be used for processing the module graph in order to create and manipulate bundles.
  - **`umd`** { string } - String name for the `UMD` module to be exported. `UMD` is a configuration that allows bundles to run in node.js, requirejs, and traditional script tags. If running in the browser, provide this setting for maximum compatibility. The name you provide is exported so that other modules can consume the bundle using that name. [This is some literature on it](https://github.com/umdjs/umd).
  - **`filePathAsId`** { boolean } (false) - Flag to tell the bundler to use modules' full path as ids instead of numeric values when generating bundles.

- **`watch`** { boolean | object } (false) - Flag to enable file watching functionality. You can optionally pass in an object to specify settings for [chokidar](https://github.com/paulmillr/chokidar).


### bundle(files) : Promise

Method to bundle a list of files. `bundle` returns a promise which returns a context when it is resolved.

- **`files`** { Array[string] | string | { string : src, string: dest } | { Array[string]: src, string: dest } } - Files to be bundled. `but-bundler` uses [src-dest](https://github.com/MiguelCastillo/src-dest) to handle file configurations.


Basic setup for bundling a file and getting a hold of the generated context.

``` javascript
var Bitbundler = require("bit-bundler");
var bitbundler = new Bitbundler();

bitbundler
  .bundle(["path/to/file.js"])
  .then(function(context) {
    console.log("Bundle ready", context.bundle.result);
  });
```

You can specify the destination of the bundle.

``` javascript
var Bitbundler = require("bit-bundler");
var bitbundler = new Bitbundler();

bitbundler
  .bundle({
    src: ["path/to/file.js"],
    dest: "output/bundle.js"
  })
  .then(function(context) {
    console.log("Bundle ready", context.bundle.result);
  });
```

### Bitbundler.bundle(files, options) : Promise

Static factory method that configures `bit-bundler` and bundles files. In contrast, you would need to first call the constructor, and then call the `bundle` method as two separate steps. Depending on your needs, one is more convenient than the other.

* The files use the same format as the `bundle` method. Please see the [bundle](#bitbundlerbundlefiles--promise) method.
* The options are the same as the constructor. Please see [Bitbundler's constructor](#bitbundleroptions--bitbundler).

``` javascript
var Bitbundler = require("bit-bundler");

Bitbundler
  .bundle({
    src: ["path/to/file.js"],
    dest: "output/bundle.js"
  }, {
    watch: true
  })
  .then(function(context) {
    console.log("Bundle ready", context.bundle.result);
  });
```

### Bitbundler.dest(destination) : Function

Static method to define where to write bundles to. This will handle writing bundle parts as well. This exposed for convenience purposes if you want to do your own setup. Otherwise passing in `dest` to [bundle](#bitbundlerbundlefiles--promise) is the way to go because it is compatible with file watching functionality.

- **`destination`** { function | string | WritableStream } - `destination` can be a `string`, in which case the internal stream factory creates a file stream to write bundles to. If `destination` is a `function`, it is called. If the call returns a `string`, then the internal stream factory creates a file stream with it, otherwise the bundle writer expects a writable stream to be used. Use a `function` if you need to create custom streams to write bundles to.

``` javascript
var Bitbundler = require("bit-bundler");
var bitbundler = new Bitbundler();

bitbundler
  .bundle(["path/to/file.js"])
  .then(Bitbundler.dest("output/path/file.js"))
  .then(function() {
    console.log("Bundle ready");
  });
```

### Bitbundler.watch(context, options) : Context

Static method for setting up file watching capabilities. This is internally used by `bit-bundler` when you enable watching via the `watch` flag. This is exposed for convenience purposes if you want to venture out with your own setup.

* The context is what the call to `bundle` generates.
* The options is an optional object with settings for [chokidar](https://github.com/paulmillr/chokidar). Default values are to not follow symlinks with `followSymlinks` set to false. It also ignores dot files and the `node_modules` directory via the `ignored` option. Please feel free pass in your own settings.

Vanilla setup.

``` javascript
var Bitbundler = require("bit-bundler");

Bitbundler
  .bundle({
    src: ["path/to/file.js"],
    dest: "output/bundle.js"
  })
  .then(Bitloader.watch)
  .then(function(context) {
    console.log("Bundle ready", context.bundle.result);
  });
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
  })
  .then(function(context) {
    console.log("Bundle ready", context.bundle.result);
  });
```

## Context

When calling the methods for generating bundles, `bit-bundler` returns a promise that gives back a context. This context has the resulting bundles and the information used for generating the bundles. The context also has enough information to update bundles and a method to do so; `execute(files)`. The context is generated with the following information:

- **`bundle`** { {string: result} } - Object with a `result` string. `result` is the string to be written to disk.
- **`cache`** { object } - Map of modules by module `id`.
- **`exclude`** { Array[string] } - Array of module `ids` to exclude from `bundle`. This is used by post processor for features like bundle splitting.
- **`file`** { { Array[string] : src, string : dest } } - Object with `src` files to bundle and `dest` is where the bundle is to be written to.
- **`modules`** { Array[object] } - Array of root modules of the module graph. These modules have an `id` that are used as keys into the `cache` to get full module objects.
- **`parts`** { object } - Map of bundle parts pulled out of the main `bundle` in the context. This map will have items created by plugins like [bundle splitter](https://github.com/MiguelCastillo/bit-bundler-splitter) that can extract modules and generate separate bundles.

> The context is generally used by plugins and post processors such as [bit-bundler-splitter](https://github.com/MiguelCastillo/bit-bundler-splitter), [Bitbundler.dest](#bitbundlerdestdestination--function), and [Bitbundler.watch](#bitbundlerwatchcontext-options--context).

Once you have a context, you can call the method `execute` with a list of files that need to be reprocessed and to generate new bundles. This exactly what [Bitbundler.watch](#bitbundlerwatchcontext-options--context) uses.


## Loader Plugins

Loader plugins enable loading and processing of your assets via transforms and other loader hooks. Generally speaking, you will be using at least [bit-loader-js](https://github.com/MiguelCastillo/bit-loader-js) to load your JavaScript assets and perhaps configure transforms.

List of core loader plugins:

- [bit-eslint](https://github.com/MiguelCastillo/bit-eslint) for integrating with eslint
- [bit-loader-babel](https://github.com/MiguelCastillo/bit-loader-babel) for transpiling your code with babeljs
- [bit-loader-js](https://github.com/MiguelCastillo/bit-loader-js) for loading and processing JavaScript assets
- [bit-loader-json](https://github.com/MiguelCastillo/bit-loader-json) for loading and processing JSON assets
- [bit-loader-css](https://github.com/MiguelCastillo/bit-loader-css) for loading and processing css assets
- [bit-loader-text](https://github.com/MiguelCastillo/bit-loader-text) for loading and processing text assets such as HTML
- [bit-loader-builtins](https://github.com/MiguelCastillo/bit-loader-builtins) for handling built in node.js modules
- [bit-loader-shimmer](https://github.com/MiguelCastillo/bit-loader-shimmer) for handling module shimming


## Loader Transforms

Probably the more common loader hook you will use are transforms, which allow you to transform your modules before they are bundled.

- [babel-bits](https://github.com/MiguelCastillo/babel-bits) for transpiling your JavaScript assets with [babel](http://babeljs.io/)
- [sassy-bits](https://github.com/MiguelCastillo/sassy-bits) for transpiling your SASS assets


## Bundler Plugins

Bundler plugins enable processing of bundles. A useful bundler plugin is for splitting a bundles with `bit-bundler-splitter`.

- [bit-bundler-splitter](https://github.com/MiguelCastillo/bit-bundler-splitter) for splitting bundles based on matching rules. This will handle splitting out your vendor modules.


## Integrations

- [grunt](https://github.com/MiguelCastillo/grunt-bit-bundler)
- gulp: TODO


## Tech summary

`bit-bundler` uses [bit-loader](https://github.com/MiguelCastillo/bit-loader) as module loading system. With `bit-loader`'s configurable pipeline for loading and processing modules you can configure how modules are loaded, transformed, and how dependencies are processed. The output from `bit-loader` is a module graph wrapped in a `context` that is passed on to the bundler. The bundler can be configured, although it seldom needs to be. By default, the bundler is [js bundler](https://github.com/MiguelCastillo/bit-bundler-browserpack), which is a wapper for browserpack.

> bit-bundler uses [node-browser-resolve](https://github.com/defunctzombie/node-browser-resolve) to support [node dependencies](https://nodejs.org/api/modules.html#modules_all_together) modules resolution. However, bit-bundler does not speak CJS (`require` statements) out of the box. But... For this, you can use [bit-loader-js](https://github.com/MiguelCastillo/bit-loader-js).


## Processing flow

The way that `bit-bundler` works is simple. The files to be bundled are handed off to `bit-loader`. `bit-loader` loads these files from disk, applies any transforms, and *recursively* loads and processes all module dependencies. The output of this is a module graph. The pipeline that does all this work can be configured via plugins, which are relatively simple to create. The settings for `bit-loader` step are the `loader` options passed in to the `bit-bundler` constructor.

`bit-bundler` then creates a `context`, which has the module graph created by `bit-loader`. The `context` also has a `cache`, which is a flattened map of the module graph with the module `ids` as the keys.  This `context` is passed to the [bundler](https://github.com/MiguelCastillo/bit-bundler-browserpack), which is a wrapper for browserpack. What you get at the end is the `context` with the `bundle` as well other information that's generally of interest if you are looking to do any further processing on the generated `bundle`.

What you write to disk is generally `context.bundle.result`. You also write to disk `context.parts`, if you are using bundler plugins such as [bit-bundler-splitter](https://github.com/MiguelCastillo/bit-bundler-splitter) that can split up `context.bundle`.


## License

Licensed under MIT
