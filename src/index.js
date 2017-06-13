var defaultOptions = require("./defaultOptions");
var utils = require("belty");
var File = require("src-dest");
var types = require("dis-isa");
var EventEmitter = require("events");
var Stream = require("stream");
var es = require("event-stream");
var deprecate = require("deprecate");
var Loader = require("./loader");
var Bundler = require("./bundler");
var Context = require("./context");
var bundleWriter = require("./bundleWriter");
var watch = require("./watch");
var loggerFactory = require("./logger");
var buildstats = require("../loggers/buildstats");

var logger = loggerFactory.create("bundler/build");


function Bitbundler(options) {
  if (!(this instanceof Bitbundler)) {
    return new Bitbundler(options);
  }

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

Bitbundler.prototype = Object.create(EventEmitter.prototype);
Bitbundler.prototype.constructor = Bitbundler;


Bitbundler.prototype.bundle = function(files) {
  var file = new File(files);
  var bitbundler = this;
  var context = bitbundler._createContext(file, bitbundler.options);
  bitbundler.context = context;
  logger.log("build-init");

  return bitbundler.update(files).then(function(ctx) {
    if (bitbundler.options.watch) {
      watch(bitbundler, bitbundler.options.watch);
    }

    return ctx;
  });
};

Bitbundler.prototype.update = function(files) {
  var file = new File(files);
  var bitbundler = this;
  var context = bitbundler.context;
  logger.log("build-start");

  file.src
    .filter(function(filePath) {
      return context.cache[filePath];
    })
    .forEach(function(filePath) {
      context.loader.deleteModule(context.cache[filePath]);
    });

  return context
    .execute(file.src)
    .then(function writeBundle(context) {
      logger.log("build-writing");
      return bitbundler._writeContext(context);
    })
    .then(function(context) {
      bitbundler.context = context;

      context.visitBundles(function(bundle, dest, isMain) {
        logger.log(bundle.content ? "bundle" : "empty-bundle", bundle, isMain);
      });

      logger.log("build-success", context);
      logger.log("build-end");
      return context;
    }, function(err) {
      logger.error("build-failure", err);
      logger.log("build-end");
      throw err;
    });
};

Bitbundler.prototype.hasModule = function(modulePath) {
  return this.context.cache.hasOwnProperty(modulePath);
};

Bitbundler.prototype.getModules = function() {
  return this.context.cache;
};

Bitbundler.prototype.getLogger = function(name) {
  return loggerFactory.create(name);
};

Bitbundler.bundle = function(files, settings) {
  return new Bitbundler(settings).bundle(files);
};

Bitbundler.prototype._createContext = function(file, options) {
  return new Context({
    file: file,
    loader: createLoader(options),
    bundler: createBundler(options)
  });
};

Bitbundler.prototype._writeContext = function(context) {
  return bundleWriter()(context);
};

function createLoader(options) {
  if (Array.isArray(options.loader)) {
    options.loader = {
      plugins: options.loader
    };
  }

  var settings = Object.assign(utils.pick(options, ["stubNotFound", "sourceMap", "baseUrl"]), defaultOptions.loader, options.loader);
  return new Loader(settings);
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

  [].concat(notifications).forEach(function(notification) {
    if (types.isFunction(notification)) {
      notification = notification(bitbundler) || {};
    }

    Object.keys(notification).forEach(function(notificationName) {
      [].concat(notification[notificationName]).forEach(function(cb) {
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
