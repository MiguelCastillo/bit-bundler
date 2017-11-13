"use strict";

var defaultOptions = require("./defaultOptions");
var utils = require("belty");
var File = require("src-dest");
var types = require("dis-isa");
var EventEmitter = require("events");
var Stream = require("stream");
var es = require("event-stream");
var deprecatedOptions = require("./deprecatedOptions")("bit-bundler");
var loaderFactory = require("./loaderFactory");
var Bundler = require("./bundler");
var Bundle = require("./bundle");
var Context = require("./context");
var bundleWriter = require("./bundleWriter");
var watch = require("./watch");
var loggerFactory = require("./logger");
var buildstats = require("../loggers/buildstats");

var logger = loggerFactory.create("bundler/build");

class Bitbundler extends EventEmitter {
  constructor(options) {
    super();

    this.options = processDeprecated(Object.assign({}, defaultOptions, options));
    configureNotifications(this, this.options.notifications);
    configureLogger(this, this.options.log, loggerFactory);

    this.context = null;
    this.loader = createLoader(this.options);
    this.bundler = createBundler(this.options);
  }

  bundle(files) {
    logger.log("build-init");

    var file = files instanceof File ? files : new File(files);
    this.context = new Context().setBundle(new Bundle("main", { dest: file.dest }, true));

    return this.update(file).then((context) => {
      if (this.options.watch) {
        watch(this, this.options.watch);
      }

      if (this.options.multiprocess) {
        if (this.options.watch) {
          this.loader.pool.size(1);          
        }
        else {
          this.loader.pool.stop();          
        }
      }

      return context;
    });
  }

  update(files) {
    logger.log("build-start");

    var file = files instanceof File ? files : new File(files);
    var loader = this.loader;

    file.src
      .filter(filePath => loader.hasModule(filePath))
      .map(filePath => loader.getModule(filePath))
      .forEach(mod => loader.deleteModule(mod));

    return this
      .buildBundles(file)
      .then((context) => {
        logger.log("build-writing");
        return bundleWriter()(context);
      })
      .then((context) => {
        context.visitBundles((bundle) => logger.log("bundle", bundle));
        logger.log("build-success", context);
        logger.log("build-end");
        this.context = context;
        return context;
      })
      .catch((err) => {
        if (err) {
          process.stderr.write((err && err.stack ? err.stack : err) + "\n");
        }

        if (this.options.multiprocess) {
          this.loader.pool.stop();
        }

        logger.error("build-failure", err);
        logger.log("build-end");
        throw err;
      });
  }

  getLogger(name) {
    return loggerFactory.create(name);
  }

  buildBundles(files) {
    var file = files instanceof File ? files : new File(files);
    var context = this.context;
    var loader = this.loader;
    var bundler = this.bundler;

    return loader
      .fetch(file.src)
      .then((modules) => {
        return bundler.bundle(context.configure({
          cache: loader.getCache(),
          modules: context.modules ? context.modules : modules,
          lastUpdatedModules: flattenModules(loader, modules),
          shards: {},
          exclude: []
        }));
      });
  }
}

Bitbundler.bundle = function(files, settings) {
  return new Bitbundler(settings).bundle(files);
};


function createLoader(options) {
  if (Array.isArray(options.loader)) {
    options.loader = {
      plugins: options.loader
    };
  }

  var settings = Object.assign(utils.pick(options, ["stubNotFound", "sourceMap", "baseUrl", "multiprocess"]), defaultOptions.loader, options.loader);
  return loaderFactory(settings);
}

function createBundler(options) {
  if (Array.isArray(options.bundler)) {
    options.bundler = {
      plugins: options.bundler
    };
  }

  var settings = Object.assign(utils.pick(options, ["umd", "sourceMap"]), defaultOptions.bundler, options.bundler);
  return new Bundler(settings);
}


function processDeprecated(options) {
  return deprecatedOptions({
    ignoreNotFound: {
      replacement: "stubNotFound",
      autocorrect: true
    }
  })(options);
}

function configureNotifications(bitbundler, notifications) {
  if (!notifications) {
    return;
  }

  [].concat(notifications).forEach((notification) => {
    if (types.isFunction(notification)) {
      notification = notification(bitbundler) || {};
    }

    Object.keys(notification).forEach((notificationName) => {
      [].concat(notification[notificationName]).forEach((cb) => {
        bitbundler.on(notificationName, cb);
      });
    });
  });
}

function configureLogger(bitbundler, options, loggerFactory) {
  if (options === true) {
    options = {
      level: "info"
    };
  }
  else if (types.isString(options)) {
    options = {
      level: options
    };
  }
  else if (options instanceof Stream) {
    options = {
      stream: options
    };
  }

  loggerFactory
    .enableAll()
    .pipe(es.through(function(chunk) {
      chunk.name === "bundler/build" ?
        bitbundler.emit.apply(bitbundler, chunk.data) :
        bitbundler.emit(chunk.name, chunk);

      this.emit("data", chunk);
    }))
    .pipe(options && options.stream ? options.stream : buildstats(options));
}

function flattenModules(loader, modules) {
  var i = 0;
  var stack = modules.slice(0);
  var id, mod, result = {};

  while (stack.length !== i) {
    if (!stack[i].id) {
      logger.warn("not-found", stack[i]);
    }

    id = stack[i++].id;

    if (!id || result.hasOwnProperty(id)) {
      continue;
    }

    mod = loader.getModule(id);
    stack = stack.concat(mod.deps);
    result[mod.id] = mod;
  }

  return result;
}


Bitbundler.dest = bundleWriter;
Bitbundler.watch = watch;
Bitbundler.Context = Context;
Bitbundler.File = File;
module.exports = Bitbundler;

