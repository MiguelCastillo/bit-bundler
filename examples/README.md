<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**

- [Most basic example](#most-basic-example)
  - [Setup](#setup)
  - [Run](#run)
- [Bundle JavaScript with node.js dependencies](#bundle-javascript-with-nodejs-dependencies)
  - [Setup](#setup-1)
  - [Run](#run-1)
- [Bundle JavaScript and transform it with Babel??](#bundle-javascript-and-transform-it-with-babel)
  - [Setup](#setup-2)
  - [Run](#run-2)
- [How about splitting bundles??](#how-about-splitting-bundles)
  - [Setup](#setup-3)
  - [Run](#run-3)
- [Some file watching, please!](#some-file-watching-please)
  - [Setup](#setup-4)
  - [Run](#run-4)
- [ESLint plugin](#eslint-plugin)
  - [Setup](#setup-5)
  - [Run](#run-5)
- [Module caching plugin!!](#module-caching-plugin)
  - [Setup](#setup-6)
  - [Run](#run-6)
- [Stream to logstash to elasticsearch... Why not?](#stream-to-logstash-to-elasticsearch-why-not)
  - [Setup](#setup-7)
  - [Run](#run-7)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

These are some examples/recipes to get you started with. These examples cover concepts that range from the most basic setup to a more advanced setup where bundles are split.

You can certainly run these examples too.

```
$ npm install
$ node basic
$ node jsplugin
```

## Most basic example

that loads `src/main.js` and bundles it.

### Setup
``` javascript
var Bitbundler = require("bit-bundler");
var buildstats = require("bit-bundler/loggers/buildstats");

var bitbundler = new Bitbundler({
  log: buildstats()
});

bitbundler
  .bundle({
    src: "src/main.js",
    dest: "dest/basic.js"
  });
```

### Run
```
$ node basic.js
```

## Bundle JavaScript with node.js dependencies

By default, `bit-bundler` does not understand how to process module dependencies.  So we will rely on [bit-loader-js](https://github.com/MiguelCastillo/bit-loader-js) to help us out here.

### Setup
``` javascript
var Bitbundler = require("bit-bundler");
var buildstats = require("bit-bundler/loggers/buildstats");
var jsPlugin = require("bit-loader-js");

var bitbundler = new Bitbundler({
  log: buildstats(),
  loader: {
    plugins: jsPlugin()
  }
});

bitbundler
  .bundle({
    src: "src/main.js",
    dest: "dest/jsplugin.js"
  });
```

### Run
```
$ node jsplugin.js
```

## Bundle JavaScript and transform it with Babel??

Yes please! This setup relies on a helper module called [bit-loader-babel](https://github.com/MiguelCastillo/bit-loader-babel).

### Setup
``` javascript
var Bitbundler = require("bit-bundler");
var buildstats = require("bit-bundler/loggers/buildstats");
var jsPlugin = require("bit-loader-js");
var babelPlugin = require("bit-loader-babel");

var bitbundler = new Bitbundler({
  log: buildstats(),
  loader: {
    plugins: [
      jsPlugin(),
      babelPlugin({
        options: {
          presets: ["es2015"],
          sourceMap: "inline"
        }
      })
    ]
  }
});

bitbundler
  .bundle({
    src: "src/main.js",
    dest: "dest/babel.js"
  });
```

### Run
```
$ node babel
```


## How about splitting bundles??

Yup, use the bundler plugin [bit-bundler-splitter](https://github.com/MiguelCastillo/bit-bundler-splitter) to help us here.

> You can configure multiple bundle splitters with matching rules to generate multiple bundles.

### Setup
``` javascript
var Bitbundler = require("bit-bundler");
var buildstats = require("bit-bundler/loggers/buildstats");
var jsPlugin = require("bit-loader-js");
var babelPlugin = require("bit-loader-babel");
var splitBundle = require("bit-bundler-splitter");

var bitbundler = new Bitbundler({
  log: buildstats(),
  loader: {
    plugins: [
      jsPlugin(),
      babelPlugin()
    ]
  },
  bundler: {
    plugins: [
      splitBundle("dest/splitter-vendor.js"),
      splitBundle("dest/splitter-renderer.js", { match: { path: /src\/renderer/ } })
    ]
  }
});

bitbundler
  .bundle({
    src: "src/main.js",
    dest: "dest/splitter-main.js"
  });
```

### Run
```
$ node splitter
```


## Some file watching, please!

Probably the most common setup would be to include file watching functionality. This setup is pretty much the same as the splitter example, but it just passed `watch: true` to enable file watching.

### Setup
``` javascript
var jsPlugin = require("bit-loader-js");
var babelPlugin = require("bit-loader-babel");
var splitBundle = require("bit-bundler-splitter");
var Bitbundler = require("bit-bundler");
var buildstatsLogger = require("bit-bundler/loggers/buildstats");
var watchLogger = require("bit-bundler/loggers/watch");

var logger = watchLogger();
logger.pipe(buildstatsLogger());

var bitbundler = new Bitbundler({
  log: logger,
  loader: {
    plugins: [
      jsPlugin(),
      babelPlugin()
    ]
  },
  bundler: {
    plugins: [
      splitBundle("dest/watch-renderer.js", { match: { path: /src\/renderer/ } }),
      splitBundle("dest/watch-other.js", { match: { fileName: "other.js" } })
    ]
  },
  watch: true
});

bitbundler
  .bundle({
    src: "src/main.js",
    dest: "dest/watch-main.js"
  });
```

### Run
```
$ node watch
```


## ESLint plugin

### Setup
``` javascript
var Bitbundler = require("bit-bundler");
var buildstats = require("bit-bundler/loggers/buildstats");
var jsPlugin = require("bit-loader-js");
var eslintPlugin = require("bit-eslint");

var bitloader = new Bitbundler({
  watch: true,
  log: buildstats(),
  loader: {
    plugins: [
      jsPlugin(),
      eslintPlugin()
    ]
  }
});

bitloader
  .bundle({
    src: "src/main.js",
    dest: "dest/eslint-build.js"
  });
```

### Run
```
$ node eslint
```


## Module caching plugin!!

The following example illustrates how to setup a module caching plugin. This is primarily for improving load time after initial load. By default, the cache plugin writes to disk but you can use connectors to use other data sources. The cache plugin includes an elasticsearch connector.

### Setup
``` javascript
var Bitbundler = require("bit-bundler");
var buildstats = require("bit-bundler/loggers/buildstats");
var jsPlugin = require("bit-loader-js");
var cachePlugin = require("bit-loader-cache");

/**
 * By default the cache plugin will save and load from disk. But you can create/configure
 * cache connectors to use other data sources. The code commented out in the cache plugin
 * configuration is for caching data out to elasticsearch.
 */

// var elasticsearchConnector = require("bit-loader-cache/connectors/elasticsearch");

var bitbundler = new Bitbundler({
  log: buildstats(),
  loader: {
    plugins: [
      jsPlugin(),
      cachePlugin({
        // connector: elasticsearchConnector({
        //   host: "localhost:9200",
        //   index: "cache_example",
        //   type: "modules"
        // })
      })
    ]
  }
});

bitbundler
  .bundle({
    src: "src/main.js",
    dest: "dest/cache_plugin.js"
  });
```

### Run
```
$ node cache_plugin.js
```


## Stream to logstash to elasticsearch... Why not?

The following example illustrates the use of streams to filter and format data. The data is then streamed to process.stdout so that the output of but-bundler can be piped to logstash.

Make sure to checkout the [logstash.config](https://github.com/MiguelCastillo/bit-bundler/blob/master/examples/logstash.config) file.

> This example was setup to run against elasticsearch and logstash 2.4.0.

### Setup
``` javascript
var Bitbundler = require("bit-bundler");
var loaderLogger = require("bit-bundler/loggers/loader");
var jsPlugin = require("bit-loader-js");
var JSONStream = require("JSONStream");

var logger = loaderLogger();
logger
  .pipe(JSONStream.stringify(false))
  .pipe(process.stdout);

var bitbundler = new Bitbundler({
  log: logger,
  loader: {
    plugins: jsPlugin()
  }
});

bitbundler
  .bundle({
    src: "src/main.js",
    dest: "dest/jsplugin.js"
  })
  .then(function() {}, function(err) {
    console.log(err && err.stack ? err.stack : err);
  });
```

### Run
```
$ node logstash.js | logstash -f logstash.config
```
