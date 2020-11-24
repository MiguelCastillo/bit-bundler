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
var logging = require("./logging");
var buildstats = require("../loggers/buildstats");

var logger = logging.create("bundler/build");
var id = 0;

class Bitbundler extends EventEmitter {
  constructor(options) {
    super();

    this.options = Object.assign({}, options);
    configureNotifications(this, this.options.notifications);
    configureLogger(this, this.options.log, logging);

    this.context = null;
    this.loader = loaderFactory(this.options);
    this.bundler = bundlerFactory(this.options);
  }

  bundle(files) {
    logger.log("build-init");

    const file = configureFiles(files);
    const generateEntryId = (src) => (types.isString(src) ? src : (src.id || src.path || "@anonymous-" + id++));
    const entries = file.src.map(generateEntryId);
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

    return this
      .buildBundles(files)
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
    return logging.create(name);
  }

  buildBundles(files) {
    const file = configureFiles(files);
    const context = this.context;
    const loader = this.loader;
    const bundler = this.bundler;

    // Clear up cached items that need to be reprocessed
    file.src
      .filter(filePath => types.isString(filePath) && loader.hasModule(filePath))
      .map(filePath => loader.getModule(filePath))
      .forEach(mod => loader.deleteModule(mod));

    return loader
      .fetch(file.src)
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

function configureLogger(bitbundler, options, logging) {
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

  const loggerStream = logging.pipe(es.through(function(chunk) {
    chunk.name === "bundler/build" ?
      bitbundler.emit.apply(bitbundler, chunk.data) :
      bitbundler.emit(chunk.name, chunk);

    this.emit("data", chunk);
  }));

  if (options !== false) {
    loggerStream.pipe(options && options.stream ? options.stream : buildstats(options));
  }
}

function configureFiles(files) {
  if (files.constructor === Object && (files.content || files.path)) {
    files = Object.assign({}, utils.omit(files, ["content", "path"]), {
      src: [].concat(files.src || [], utils.pick(files, ["content", "path"]))
    });
  }

  return new File(files);
}


Bitbundler.dest = bundleWriter;
Bitbundler.watch = watch;
Bitbundler.Context = Context;
Bitbundler.File = File;
module.exports = Bitbundler;
