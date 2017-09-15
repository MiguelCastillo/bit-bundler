## Examples

These are some examples/recipes to get you started with. These examples cover concepts that range from the most basic setup to a more advanced setup with bundle splitting.

In order to run examples, please clone [bit-bundler](https://github.com/MiguelCastillo/bit-bundler) first.

```
$ git clone https://github.com/MiguelCastillo/bit-bundler.git
$ cd bit-bundler/examples
```

And now you should be able to run each one of the examples below. Link for [source code](https://github.com/MiguelCastillo/bit-bundler/tree/master/examples) for all the examples below.


### Hello World

Getting started with a really basic setup.

##### [source code](https://github.com/MiguelCastillo/bit-bundler/tree/master/examples/hello-world)

#### Run
```
$ cd hello-world
$ npm install
$ npm run build
```


### node.js dependencies

By default, `bit-bundler` does not understand how to load module dependencies. So we will rely on [bit-loader-js](https://github.com/MiguelCastillo/bit-loader-js) to help us out here.

##### [source code](https://github.com/MiguelCastillo/bit-bundler/tree/master/examples/dependencies)

#### Run
```
$ cd dependencies
$ npm install
$ npm run build
```


### Transpile with Babel??

Yes please! This setup relies on a helper module called [bit-loader-babel](https://github.com/MiguelCastillo/bit-loader-babel).

> .babelrc files are automatically loaded, which is the preferred method of configuring babel

##### [source code](https://github.com/MiguelCastillo/bit-bundler/tree/master/examples/babel)

#### Run
```
$ cd babel
$ npm install
$ npm run build
```


### How about bundle splitting??

Yup, use the bundler plugin [bit-bundler-splitter](https://github.com/MiguelCastillo/bit-bundler-splitter) to help us here.

> You can configure multiple bundle splitters with matching rules to generate multiple bundles.

##### [source code](https://github.com/MiguelCastillo/bit-bundler/tree/master/examples/splitter)

#### Run
```
$ cd splitter
$ npm install
$ npm run build
```


### Some file watching, please!

Probably the most common setup would be to include file watching functionality. Just specify `watch: true` to enable file watching.

##### [source code](https://github.com/MiguelCastillo/bit-bundler/tree/master/examples/watch)

#### Run
```
$ cd watch
$ npm install
$ npm run build
```


### ESLint plugin

Lint the files that really matter - the files used by your code.

> .eslintrc files are automatically loaded, which is the preferred method of configuring eslint

##### [source code](https://github.com/MiguelCastillo/bit-bundler/tree/master/examples/eslint)

#### Run
```
$ cd eslint
$ npm install
$ npm run build
```


### Multiprocess

bit-bundler can process module dependencies in parallel in child processes. To enable this feature you need to set multiprocess to true, which starts two child process. Or set it to a number to specify the number of child processes to start. I have found that the sweet spot for large projects is 4.

##### [source code](https://github.com/MiguelCastillo/bit-bundler/tree/master/examples/multiprocess)

#### Run
```
$ cd multiprocess
$ npm install
$ npm run build
```


### JavaScript Minification

In order to setup JavaScript minification, we will rely on [bit-bundler-minifyjs](https://github.com/MiguelCastillo/bit-bundler-minifyjs).

##### [source code](https://github.com/MiguelCastillo/bit-bundler/tree/master/examples/minify)

#### Run
```
$ cd minify
$ npm install
$ npm run build
```


### Loggers.

bit-bundler streams tons of information, which you can harness via loggers. Loggers themselves are just duplex streams so you can easily create your own loggers.

##### [source code](https://github.com/MiguelCastillo/bit-bundler/tree/master/examples/loggers)

#### Run
```
$ cd loggers
$ npm install
$ npm run build
```


### Module caching plugin!!

The following example illustrates how to setup a module caching plugin. This is primarily for improving load time after a successful initial load. By default, the cache plugin writes to disk but you can use connectors to use other data sources. The cache plugin includes an elasticsearch connector.

> Caching will not work correctly in multiprocess mode. Simply because caching writes to the same cache file, which means that multiple process override each others work.

##### [source code](https://github.com/MiguelCastillo/bit-bundler/tree/master/examples/cache)

#### Run
```
$ cd cache
$ npm install
$ npm run build
```


### Stream to logstash to elasticsearch... Why not?

The following example illustrates the use of streams to filter and format data. The data is then streamed to process.stdout so that the output of but-bundler can be piped to logstash.

Make sure to checkout the [logstash.config](https://github.com/MiguelCastillo/bit-bundler/blob/master/examples/logstash.config) file.

> This example was setup to run against elasticsearch and logstash 2.4.0.

##### [source code](https://github.com/MiguelCastillo/bit-bundler/tree/master/examples/logstash)

#### Run
```
$ cd logstash
$ npm install
$ npm run build | logstash -f logstash.config
```

### Sample webapp setup, of course.

The webapp example illustrates how we can put together a build system with a few key tools.

- dev server with [live-server](https://github.com/tapio/live-server)
- copy of static assets with [cpx](https://github.com/mysticatea/cpx)
- bundling with (of course) [bit-bundler](https://github.com/MiguelCastillo/bit-bundler)
- process management with [pm2](https://github.com/Unitech/pm2)

The configuration in the setup is designed to be resillient, modular, and scalable. Why this approach? Simple. After working with several build systems that couple all the pieces together under a single unified system, a few things happen:

1. One piece breaks, everything goes down.
2. Plugins that wrap tools that are unrelated cause friction in your setup.
3. Plugins tend to have dependency versions fall behind, which makes coordinating with the ecosystem more difficult.
4. More levels of indirection add complexity.

With the approach of separate processes acting as their own service, you can start/restart/update/stop individual pieces without bringing down the entire build system. Also - process management with [pm2](https://github.com/Unitech/pm2) is pretty magical.

### Run
```
$ cd webapp
$ npm install
$ npm start
```
