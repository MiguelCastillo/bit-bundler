var defaultOptions = require("./defaultOptions");
var utils = require("belty");
var File = require("src-dest");
var types = require("dis-isa");
var EventEmitter = require("events");
var Stream = require("stream");
var Loader = require("./loader");
var Bundler = require("./bundler");
var Context = require("./context");
var bundleWriter = require("./bundleWriter");
var watch = require("./watch");
var loggerFactory = require("./logger");
var buildstats = require("../loggers/buildstats");

var logger = loggerFactory.create("bundler/runner");

function BitBundler(options) {
  if (!(this instanceof BitBundler)) {
    return new BitBundler(options);
  }

  this.context = null;
  this.options = options || {};
  configureLogger(this.options.log, loggerFactory);
}

BitBundler.prototype = Object.create(EventEmitter.prototype);
BitBundler.prototype.constructor = BitBundler;


BitBundler.prototype.bundle = function(files) {
  var file = new File(files);
  var bitbundler = this;
  var context = bitbundler._createContext(file, bitbundler.options);
  bitbundler.context = context;
  bitbundler.emit("init-build");

  return bitbundler.update(files).then(function(ctx) {
    if (bitbundler.options.watch) {
      watch(bitbundler, bitbundler.options.watch);
    }

    return ctx;
  });
};

BitBundler.prototype.update = function(files) {
  var file = new File(files);
  var bitbundler = this;
  var context = bitbundler.context;
  bitbundler.emit("pre-build");

  file.src
    .filter(function(filePath) {
      return context.cache[filePath];
    })
    .forEach(function(filePath) {
      context.loader.deleteModule(context.cache[filePath]);
    });

  return context.execute(file.src)
    .then(function(ctx) {
      bitbundler.context = ctx;
      bitbundler.emit("build-success", ctx);
      return ctx;
    }, function(err) {
      bitbundler.emit("build-failed", err);
      throw err;
    });
};

BitBundler.prototype.hasModule = function(modulePath) {
  return this.context.cache.hasOwnProperty(modulePath);
};

BitBundler.prototype.getModules = function() {
  return this.context.cache;
};

BitBundler.bundle = function(files, settings) {
  return new BitBundler(settings).bundle(files);
};

BitBundler.prototype._createContext = function(file, options) {
  return new Context({
    file: file,
    loader: createLoader(options.loader),
    bundler: createBundler(Object.assign({
      umd: options.umd
    }, options.bundler))
  });
};

function createLoader(options) {
  return new Loader(utils.merge({}, defaultOptions.loader, options));
}

function createBundler(options) {
  return new Bundler(utils.merge({}, defaultOptions.bundler, options));
}

function configureLogger(options, logger) {
  if (options !== false) {
    options = options || {};

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

    logger.enableAll();
    logger.level(logger.levels[options.level || "info"]);
    logger.pipe(options.stream || buildstats());
  }
  else {
    logger.disable();
  }
};

BitBundler.logger = logger;
BitBundler.dest = bundleWriter;
BitBundler.watch = watch;
BitBundler.Context = Context;
BitBundler.File = File;
module.exports = BitBundler;
