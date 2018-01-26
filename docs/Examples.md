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


### Bundling a JavaScript string

bit-bundler gives you the ability to bundle a string instead of a file. This is helpful when you are looking to bundle something without requiring you to have a file on disk.

##### [source code](https://github.com/MiguelCastillo/bit-bundler/tree/master/examples/from-contents)

#### Run
```
$ cd babel
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


### Bundle splitting??

Yup, use the bundler plugin [bit-bundler-splitter](https://github.com/MiguelCastillo/bit-bundler-splitter) to help us here.

> You can configure multiple bundle splitters with matching rules to generate multiple bundles.

This example generates multiple bundles which you can run in node with the commands below. If you take a closer look at the modules and the bundles generated you will notice that there is a circular dependencies between the entry point in the main bundle and a module in another bundle. This splitter example illustrates how bit-bundler and bit-bundler-splitter gracefully handle circular dependencies in modules, even across bundles.

##### [source code](https://github.com/MiguelCastillo/bit-bundler/tree/master/examples/splitter)

#### Run
```
$ cd splitter
$ npm install
$ npm run build
$ cat dist/vendor.js dist/renderer.js dist/other.js dist/main.js | node
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

The default strategy for caching provided by [bit-loader-cache](https://github.com/MiguelCastillo/bit-loader-cache) does not work correctly in multiprocess mode. So you should alternatively use the redis or elastichsearch (or your own) connector if you need caching in multiprocess mode. I tend to use elasticsearch because I can easily take a close look at the loaded modules using Kibana. And bonus - the cache example and the bit-loader-cache puglin have docker-compose files you can use to easily spin up a caching layer.

##### [source code](https://github.com/MiguelCastillo/bit-bundler/tree/master/examples/cache)

#### Run
```
$ cd cache
$ npm install
$ npm run build
```


### Stream to logstash to elasticsearch... Why not?

The following example illustrates the use of streams to filter and format data. The data from the bit-bundler is piped to a filter using the `loaderFilter` logger stream, then piped to JSONStream to generate JSON lines, and then piped to a TCP socket where logstash is awaiting data which gets logged and persistend in elasticsearch.

There is a [docker-compose.yml](https://github.com/MiguelCastillo/bit-bundler/blob/master/examples/logstash/docker-compose.yml) file that you can use to quickly spin an environment with logstash. The docker-compose will start elasticsearch, logstash, and kibana which is exposed on [http://localhost:5601](http://localhost:5601).  The elasticsearch index this example uses is `bit_bundler_log_example`. So if you are using kibana be sure to add that as an index pattern so that you can see what bit-bundler has sent to elasticsearch through logstash.

Also, checkout the [logstash.conf](https://github.com/MiguelCastillo/bit-bundler/blob/master/examples/logstash/logstash.conf) file if you want to see how logstash is configured.

##### [source code](https://github.com/MiguelCastillo/bit-bundler/tree/master/examples/logstash)

#### Run

On one terminal, spin up the docker images with docker-compose. From the `logstash` example directory:

```
$ docker-compose up
```

Once the docker containers are up, send some logs over to logstash with

```
$ npm install
$ npm run build
```

### Sample webapp setup, of course.

The webapp example illustrates how we can put together a build system with a few key tools.

- dev server with [3dub](https://github.com/MiguelCastillo/3dub)
- copy of static assets with [cpx](https://github.com/mysticatea/cpx)
- bundling with (of course) [bit-bundler](https://github.com/MiguelCastillo/bit-bundler)
- process management with [pm2](https://github.com/Unitech/pm2)

The configuration in the setup is designed to be resillient, modular, and scalable. Why this approach? Simple. After working with several build systems that couple all the pieces together under a single unified system, a few things happen:

1. One piece breaks, everything goes down.
2. Plugins that wrap tools that are unrelated cause friction in your setup.
3. Plugins tend to have dependency versions fall behind, which makes coordinating with the ecosystem more difficult.
4. More levels of indirection add complexity.

With the approach of separate processes acting as their own service, you can start/restart/update/stop individual pieces without bringing down the entire build system. Also - process management with [pm2](https://github.com/Unitech/pm2) is pretty magical.

##### [source code](https://github.com/MiguelCastillo/bit-bundler/tree/master/examples/webapp)

### Run
```
$ cd webapp
$ npm install
$ npm run start
```

Open webapp in the browser. [link](http://localhost:3000)

To stop the build system

```
$ npm run stop
```

To see the build logs in realtime

```
$ npm run logs
```

To see the health of the build system and logs

```
$ npm run monit
```
