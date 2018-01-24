"use strict";

var File = require("src-dest");
var types = require("dis-isa");
var utils = require("belty");
var EventEmitter = require("events");
var Stream = require("stream");
var es = require("event-stream");
var loaderFactory = require("./loader/factory");
var bundlerFactory = require("./bundler/factory");
var Bundle = require("./bundle");
var Context = require("./context");
var bundleWriter = require("./bundle/writer");
var watch = require("./watch");
var loggerFactory = require("./logger");
var buildstats = require("../loggers/buildstats");

var logger = loggerFactory.create("bundler/build");
var id = 0;

class Bitbundler extends EventEmitter {
  constructor(options) {
    super();

    this.options = Object.assign({}, options);
    configureNotifications(this, this.options.notifications);
    configureLogger(this, this.options.log, loggerFactory);

    this.context = null;
    this.loader = loaderFactory(this.options);
    this.bundler = bundlerFactory(this.options);
  }

  bundle(files) {
    logger.log("build-init");

    const file = configureFiles(files);
    const entries = file.src.map(src => src.content && !src.id ? ("@anonymous-" + id++) : src);
    this.context = new Context().setBundle(new Bundle("main", { dest: file.dest, entries: entries }, true));

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

    const file = configureFiles(files);
    var loader = this.loader;

    file.src
      .filter(filePath => types.isString(filePath) && loader.hasModule(filePath))
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
    const file = configureFiles(files);
    const context = this.context;
    const loader = this.loader;
    const bundler = this.bundler;

    return loader
      .fetch(file)
      .then(() => {
        const cache = loader.getCache();
        const mainBundle = context.getBundles("main");
        const moduleIds = Object.keys(cache);

        const updatedContext = context
          .setBundle(mainBundle.setModules(moduleIds))
          .setCache(cache);

        return bundler.bundle(updatedContext);
      });
  }
}

Bitbundler.bundle = function(files, settings) {
  return new Bitbundler(settings).bundle(files);
};

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

  const logger = loggerFactory
    .enableAll()
    .pipe(es.through(function(chunk) {
      chunk.name === "bundler/build" ?
        bitbundler.emit.apply(bitbundler, chunk.data) :
        bitbundler.emit(chunk.name, chunk);

      this.emit("data", chunk);
    }));

  if (options !== false) {
    logger.pipe(options && options.stream ? options.stream : buildstats(options));
  }
}

function configureFiles(files) {
  if (files.constructor === Object && files.content) {
    files.src = [].concat(files.src || [], utils.pick(files, ["content", "path"]));
  }

  return new File(files);
}


Bitbundler.dest = bundleWriter;
Bitbundler.watch = watch;
Bitbundler.Context = Context;
Bitbundler.File = File;
module.exports = Bitbundler;

