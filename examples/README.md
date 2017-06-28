<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**

- [Hello World](#hello-world)
  - [Run](#run)
- [Bundle JavaScript with node.js dependencies](#bundle-javascript-with-nodejs-dependencies)
  - [Run](#run-1)
- [Bundle JavaScript and transform it with Babel??](#bundle-javascript-and-transform-it-with-babel)
  - [Run](#run-2)
- [How about splitting bundles??](#how-about-splitting-bundles)
  - [Run](#run-3)
- [Some file watching, please!](#some-file-watching-please)
  - [Run](#run-4)
- [ESLint plugin](#eslint-plugin)
  - [Run](#run-5)
- [Module caching plugin!!](#module-caching-plugin)
  - [Run](#run-6)
- [Stream to logstash to elasticsearch... Why not?](#stream-to-logstash-to-elasticsearch-why-not)
  - [Run](#run-7)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

These are some examples/recipes to get you started with. These examples cover concepts that range from the most basic setup to a more advanced setup where bundles are split.


## Hello World

Getting started with a really basic setup.

### Run
```
$ cd hello-world
$ npm install
$ npm run build
```

## Bundle JavaScript with node.js dependencies

By default, `bit-bundler` does not understand how to load module dependencies. So we will rely on [bit-loader-js](https://github.com/MiguelCastillo/bit-loader-js) to help us out here.

### Run
```
$ cd js
$ npm install
$ npm run build
```

## Bundle JavaScript and transform it with Babel??

Yes please! This setup relies on a helper module called [bit-loader-babel](https://github.com/MiguelCastillo/bit-loader-babel).

### Run
```
$ cd babel
$ npm install
$ npm run build
```


## How about splitting bundles??

Yup, use the bundler plugin [bit-bundler-splitter](https://github.com/MiguelCastillo/bit-bundler-splitter) to help us here.

> You can configure multiple bundle splitters with matching rules to generate multiple bundles.

### Run
```
$ cd splitter
$ npm install
$ npm run build
```


## Some file watching, please!

Probably the most common setup would be to include file watching functionality. Just specify `watch: true` to enable file watching.

### Run
```
$ cd watch
$ npm install
$ npm run build
```


## ESLint plugin

Lint the files that really matter - the files used by your code.

### Run
```
$ cd eslint
$ npm install
$ npm run build
```


## Module caching plugin!!

The following example illustrates how to setup a module caching plugin. This is primarily for improving load time after a successful initial load. By default, the cache plugin writes to disk but you can use connectors to use other data sources. The cache plugin includes an elasticsearch connector.

### Run
```
$ cd cache
$ npm install
$ npm run build
```

## Loggers.

bit-bundler streams tons of information, which you can harness via loggers. Loggers themselves are just duplex streams so you can easily create your own loggers.

### Run
```
$ cd loggers
$ npm install
$ npm run build
```


## Stream to logstash to elasticsearch... Why not?

The following example illustrates the use of streams to filter and format data. The data is then streamed to process.stdout so that the output of but-bundler can be piped to logstash.

Make sure to checkout the [logstash.config](https://github.com/MiguelCastillo/bit-bundler/blob/master/examples/logstash.config) file.

> This example was setup to run against elasticsearch and logstash 2.4.0.


### Run
```
$ cd logstash
$ npm install
$ node logstash.js | logstash -f logstash.config
```
