"use strict";

var defaultOptions = require("./defaultOptions");
var utils = require("belty");
var File = require("src-dest");
var types = require("dis-isa");
var EventEmitter = require("events");
var Stream = require("stream");
var es = require("event-stream");
var deprecate = require("deprecate");
var loaderFactory = require("./loaderFactory");
var Bundler = require("./bundler");
var Context = require("./context");
var bundleWriter = require("./bundleWriter");
var watch = require("./watch");
var loggerFactory = require("./logger");
var buildstats = require("../loggers/buildstats");

var logger = loggerFactory.create("bundler/build");

class Bitbundler extends EventEmitter {
  constructor(options) {
    super();

    this.context = null;
    this.options = Object.assign({}, defaultOptions, options);

    // ignoreNotFound is deprecated...
    if (this.options.hasOwnProperty("ignoreNotFound")) {
      this.options.stubNotFound = this.options.ignoreNotFound;
      delete this.options.ignoreNotFound;
      deprecate("ignoreNotFound is deprecated", "Please use stubNotFound");
    }

    configureNotifications(this, this.options.notifications);
    configureLogger(this, this.options.log, loggerFactory);
  }

  bundle(files) {
    var file = new File(files);
    this.context = this._createContext(file, this.options);
    logger.log("build-init");

    return this.update(files).then((context) => {
      if (this.options.watch) {
        watch(this, this.options.watch);

        if (this.options.multiprocess) {
          context.loader.pool.size(1);
        }
      }
      else if (this.options.multiprocess) {
        context.loader.pool.stop();
      }

      this.context = context;
      return context;
    });
  }

  update(files) {
    var file = new File(files);
    logger.log("build-start");

    file.src
      .filter((filePath) => this.context.cache[filePath])
      .forEach((filePath) => this.context.loader.deleteModule(this.context.cache[filePath]));

    return this.context
      .execute(file.src)
      .then((context) => {
        logger.log("build-writing");
        return this._writeContext(context);
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
          context.loader.pool.stop();
        }

        logger.error("build-failure", err);
        logger.log("build-end");
        throw err;
      });
  }

  hasModule(modulePath) {
    return this.context.cache.hasOwnProperty(modulePath);
  }

  getModules() {
    return this.context.cache;
  }

  getLogger(name) {
    return loggerFactory.create(name);
  }

  _createContext(file, options) {
    return new Context({
      file: file,
      loader: createLoader(options),
      bundler: createBundler(options)
    });
  }

  _writeContext(context) {
    return bundleWriter()(context);
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
};

Bitbundler.dest = bundleWriter;
Bitbundler.watch = watch;
Bitbundler.Context = Context;
Bitbundler.File = File;
module.exports = Bitbundler;
