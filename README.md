<img src="https://raw.githubusercontent.com/MiguelCastillo/bit-bundler/master/img/bit-bundler_white.png" width="100%"></img>

> Bundle your Web Application with ease.

`bit-bundler` aims to simplify bundling your web applications with a focused, fluid, and intuitive API. The problem we are trying to solve is around setup complexity while providing a flexible environment that scales to meet more intricate requirements.

### Key features:

- Designed with configuration simplicity as a primary goal.
- Friendly and flexible plugin system API for authoring plugins.
- Pattern matching for fine grained control of your assets; match module path, filename, source content and so on...
- Bundle mulitple file types via plugins; JavaScript, CSS, JSON, Text...


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
- [Loader Plugins](#loader-plugins)
- [Bundler Plugins](#bundler-plugins)
- [Integrations](#integrations)
- [Context](#context)
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

> By default `bit-bundler` *can resolve* [node dependencies](https://nodejs.org/api/modules.html#modules_all_together), but it does not know how to *load* dependencies in order to build a dependency graph. To properly build a dependency from require and import statements we will rely on [bit-loader-js](https://github.com/MiguelCastillo/bit-loader-js).

``` javascript
var babelPlugin = require("bit-loader-babel");
var eslintPlugin = require("bit-eslint");
var jsPlugin = require("bit-loader-js");
var splitBundle = require("bit-bundler-splitter");
var Bitbundler = require("bit-bundler");

var bitbundler = new Bitbundler({
  watch: true,
  loader: {
    plugins: [
      eslintPlugin(),
      jsPlugin(),
      babelPlugin()
    ]
  },
  bundler: {
    plugins: [
      splitBundle("dest/vendor.js", { match: { path: /\/node_modules\// } }),
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

You can also checkout [bundler-war-room](https://github.com/MiguelCastillo/bundler-war-room) to try out `bit-bundler`.


## API

### Bitbundler(options) : Bitbundler

`bit-bundler` constructor.  Valid options are:

- **`log`** { stream | { stream: WritableStream, level: string } } (buildstats) - By default bit-bundler uses the `buildstats` stream which logs warnings, errors, and build information. You can control the log level by specifying one of the following values `'info'`, `'warn'`, `'error'`.
  - **`log.stream`** { WritableStream } - Writable stream to write log messages to. There are several sample streams in the [loggers directory](https://github.com/MiguelCastillo/bit-bundler/tree/master/loggers).
  - **`log.level`** { string } - Log level to fine tune the severity of messages to be logged. Valid values are `'info'`, `'warn'`, `'error'`.

- **`loader`** { object } - Options to be passed to the module loader.
  - **`loader.plugins`** { Plugin[] | Plugin } - Plugins to be registerer with the module loader. These plugins are for loading and procesing modules before they are bundled.
  - **`loader.ignoreNotFound`** { boolean } (false) - Flag to ignore modules that are not found in storage. When set to true these modules will just be empty entries in the bundle.

- **`bundler`** { object } - Options to be passed to the module bundler.
  - **`bundler.sourceMap`** { boolean } (true) - Flag to enable and disable the generation of source maps.
  - **`bundler.plugins`** { Plugin[] | Plugin } - Plugins to be registered with the bundler to manipulate bundles. Plugins can be used for processing the module graph generated by the module loader.
  - **`bundler.umd`** { string } - String name for the `UMD` module to be exported. `UMD` is a configuration that allows bundles to run in node.js, requirejs, and traditional script tags. If running in the browser, consider this setting for maximum compatibility. The name you provide is exported so that other modules can consume the bundle using that name. [This is some literature on it](https://github.com/umdjs/umd).
  - **`bundler.exportNames`** { boolean } (false) - Flag to export modules by name rather than ID if the modules are not relative names. The only modules that are exported by name are root modules.

- **`watch`** { boolean | object } (false) - Flag to enable file watching functionality. You can optionally pass in an object to specify settings for [chokidar](https://github.com/paulmillr/chokidar).


### bundle(files) : Promise

Method to bundle a list of files. `bundle` returns a promise that returns a context when it is resolved.

- **`files`** { string[] | string | { string : src, string: dest } | { string[]: src, string: dest } } - Files to be bundled. `but-bundler` uses [src-dest](https://github.com/MiguelCastillo/src-dest) to handle file configurations. Please do check it out if you need more details about configuring files.


Basic setup for bundling a file.

``` javascript
var Bitbundler = require("bit-bundler");
var bitbundler = new Bitbundler();

bitbundler.bundle(["path/to/file.js"]);
```

You can specify the destination of the bundle.

``` javascript
var Bitbundler = require("bit-bundler");
var bitbundler = new Bitbundler();

bitbundler.bundle({
  src: ["path/to/file.js"],
  dest: "output/bundle.js"
});
```

### Bitbundler.bundle(files, options) : Promise

Static factory method that configures `bit-bundler` and bundles files. In contrast, you would need to first call the constructor, and then call the `bundle` method as two separate steps. Depending on your needs, one is more convenient than the other.

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

### Bitbundler.dest(destination) : Function

Static method to define where to write bundles to. This will handle writing bundle shards as well. This is exposed for convenience purposes in case you want to hand roll your own setup. Otherwise, passing in `dest` to the [bundle](#bundlefiles--promise) method is the preferred approach because that is compatible with file watching.

> This is not compatible with file watching.

- **`destination`** { function | string | WritableStream } - `destination` can be a `string`, in which case the internal stream factory creates a file stream to write bundles to it. If `destination` is a `function`, it is called. If the call returns a `string`, then the internal stream factory creates a file stream with it, otherwise the bundle writer expects a writable stream to be used. Use a `function` if you need to create custom streams to write bundles to.

``` javascript
var Bitbundler = require("bit-bundler");
var bitbundler = new Bitbundler();

bitbundler
  .bundle(["path/to/file.js"])
  .then(Bitbundler.dest("output/path/file.js"));
```

### Bitbundler.watch(context, options) : Context

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


## Loader Plugins

Loader plugins enable loading and processing of your assets via transforms and other loader hooks. Generally speaking, you will be using at least [bit-loader-js](https://github.com/MiguelCastillo/bit-loader-js) to load your JavaScript assets.

This is the list of npm [bit-loader-plugin](https://www.npmjs.com/browse/keyword/bit-loader-plugin). Be sure to add the `bit-loader-plugin` keyword to the package.json when authoring your plugins.

List of core loader plugins:

- [bit-eslint](https://github.com/MiguelCastillo/bit-eslint) for integrating with eslint
- [bit-loader-babel](https://github.com/MiguelCastillo/bit-loader-babel) for transpiling your code with babeljs
- [bit-loader-js](https://github.com/MiguelCastillo/bit-loader-js) for loading and processing JavaScript dependencies
- [bit-loader-json](https://github.com/MiguelCastillo/bit-loader-json) for loading and processing JSON assets
- [bit-loader-css](https://github.com/MiguelCastillo/bit-loader-css) for loading and processing CSS assets
- [bit-loader-text](https://github.com/MiguelCastillo/bit-loader-text) for loading and processing text assets such as HTML
- [bit-loader-builtins](https://github.com/MiguelCastillo/bit-loader-builtins) for handling built in node.js modules (process, path, crypto...)
- [bit-loader-shimmer](https://github.com/MiguelCastillo/bit-loader-shimmer) for handling module shimming; modules that are not built as modules.
- [bit-loader-cache](https://github.com/MiguelCastillo/bit-loader-cache) for module caching
- [bit-loader-extensions](https://github.com/MiguelCastillo/bit-loader-extensions) for supporting loading modules without file extensions


## Bundler Plugins

Bundler plugins for processing of bundles and module graphs.

- [bit-bundler-splitter](https://github.com/MiguelCastillo/bit-bundler-splitter) for splitting bundles based on matching rules. This will handle splitting out your vendor modules.


## Integrations

- [grunt](https://github.com/MiguelCastillo/grunt-bit-bundler)
- gulp: TODO


## Context

When calling [bundle](#bundlefiles--promise) to generate bundles, a promise is returned that gives back a context when it is resolved. This context has the resulting bundles and the information used for generating the bundles. The context also has enough information to update bundles and a method to do so; `execute(files)`. The context is generated with the following information:

- **`bundle`** { {string: result} } - Object with a `result` string. `result` is the string to be written to disk.
- **`cache`** { object } - Map of modules by module `id`.
- **`exclude`** { string[] } - Array of module `ids` to exclude from `context.bundle`. This is used by bundler plugins such as [bit-bundler-splitter](https://github.com/MiguelCastillo/bit-bundler-splitter) in order to specify which modules to exclude from `context.bundle`.
- **`file`** { { string[] : src, string : dest } } - Object with `src` files to bundle up and `dest` to specify where to write `context.bundle` to.
- **`modules`** { object[] } - Array of root modules of the module graph generated by the module loader. These modules have an `id` that are used as keys into the `cache` to get full module objects.
- **`shards`** { object } - Map of shards pulled out of the main `context.bundle`. This map contains items created by bundler plugins such as [bundle splitter](https://github.com/MiguelCastillo/bit-bundler-splitter).

- **`getLogger`** { function } - Method to create loggers. The method takes an optional string name which is used when logging messages.

> The context is generally used by plugins and post processors such as [bit-bundler-splitter](https://github.com/MiguelCastillo/bit-bundler-splitter), [Bitbundler.dest](#bitbundlerdestdestination--function), and [Bitbundler.watch](#bitbundlerwatchcontext-options--context).

Once you have a context, you can call the `execute` method with a list of files that need to be reprocessed in order to regenerate new bundles. This exactly what [Bitbundler.watch](#bitbundlerwatchcontext-options--context) does internally.


## Tech summary

`bit-bundler` uses [bit-loader](https://github.com/MiguelCastillo/bit-loader) as module loading system. With `bit-loader`'s configurable pipeline for loading and processing modules you can configure how modules are loaded, transformed, and how dependencies are processed. The output from `bit-loader` is a module graph wrapped in a `context` that is passed on to the bundler. The bundler can be configured, although it seldom needs to be. By default, the bundler is [js bundler](https://github.com/MiguelCastillo/bit-bundler-browserpack), which is a wapper for browserpack.

> bit-bundler uses [node-browser-resolve](https://github.com/defunctzombie/node-browser-resolve) to support [node dependencies](https://nodejs.org/api/modules.html#modules_all_together) modules resolution. However, bit-bundler does not speak CJS (`require` statements) out of the box. But... For this, you can use [bit-loader-js](https://github.com/MiguelCastillo/bit-loader-js).


## Processing flow

The way that `bit-bundler` works is simple. The files to be bundled are handed off to `bit-loader`. `bit-loader` loads these files from disk, applies any transforms, and *recursively* loads and processes all module dependencies. The output of this is a module graph. The pipeline that does all this work can be configured via plugins, which are relatively simple to create. The settings for `bit-loader` are the `loader` options passed to the `bit-bundler` constructor.

`bit-bundler` then creates a `context`, which has the module graph created by `bit-loader`. The `context` also has a `cache`, which is a flattened map of the module graph with the module `ids` as the keys.  This `context` is passed to the [bundler](https://github.com/MiguelCastillo/bit-bundler-browserpack), which is a wrapper for browserpack. What you get at the end is the `context` with the `bundle` as well other information that's generally of interest if you are looking to do any further processing on the generated `bundle`.

What you write to disk is generally `context.bundle.result`. You also write to disk `context.shards`, if you are using bundler plugins such as [bit-bundler-splitter](https://github.com/MiguelCastillo/bit-bundler-splitter) that can split up `context.bundle`.


## License

Licensed under MIT
