var defaultOptions = require("./defaultOptions");
var utils = require("belty");
var File = require("src-dest");
var types = require("dis-isa");
var stream = require("stream");
var Loader = require("./loader");
var Bundler = require("./bundler");
var Context = require("./context");
var bundleWriter = require("./bundleWriter");
var watch = require("./watch");
var loggerFactory = require("./logger");
var buildstats = require("../loggers/buildstats");

var logger = loggerFactory.create("bundler/runner");

function Runner(options) {
  if (!(this instanceof Runner)) {
    return new Runner(options);
  }

  this.options = options || {};
  configureLogger(this.options.log, loggerFactory);
}

Runner.prototype.bundle = function(files) {
  var file = new File(files);

  return createContext(file, this.options)
    .execute(file.src)
    .then(initWatch.bind(this));
};

Runner.bundle = function(files, settings) {
  return new Runner(settings).bundle(files);
};

function createContext(file, options) {
  return new Context({
    file: file,
    loader: createLoader(options.loader),
    bundler: createBundler(Object.assign({
      umd: options.umd
    }, options.bundler))
  });
}

function createLoader(options) {
  return new Loader(utils.merge({}, defaultOptions.loader, options));
}

function createBundler(options) {
  return new Bundler(utils.merge({}, defaultOptions.bundler, options));
}

function initWatch(ctx) {
  if (this.options.watch) {
    watch(ctx, this.options.watch);
  }

  return ctx;
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
    else if (options instanceof stream) {
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

Runner.logger = logger;
Runner.dest = bundleWriter;
Runner.watch = watch;
Runner.Context = Context;
Runner.File = File;
module.exports = Runner;
