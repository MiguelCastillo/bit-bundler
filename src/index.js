var defaultOptions = require("./defaultOptions");
var utils = require("belty");
var File = require("src-dest");
var Loader = require("./loader");
var Bundler = require("./bundler");
var Context = require("./context");
var bundleWriter = require("./bundleWriter");
var watch = require("./watch");
var types = require("dis-isa");
var Logger = require("loggero");
var logger = Logger.create("bundler/runner");
var Bitloader = require("bit-loader");

function Runner(options) {
  if (!(this instanceof Runner)) {
    return new Runner(options);
  }

  this.options = options || {};
  this.context = null;

  configureLogger(this.options.log, Logger);
  configureLogger(this.options.log, Bitloader.logger);
}

Runner.prototype.bundle = function(files) {
  var file = new File(files);

  if (!this.context) {
    this.context = createContext(file, this.options);
  }

  return this.context
    .execute(file.src)
    .then(setContext.bind(this))
    .then(initWatch.bind(this));
};

Runner.bundle = function(files, settings) {
  return new Runner(settings).bundle(files);
};

function createContext(file, options) {
  return new Context({
    file: file,
    loader: createLoader(options.loader),
    bundler: createBundler(options.bundler)
  });
}

function createLoader(options) {
  return new Loader(utils.merge({}, defaultOptions.loader, options));
}

function createBundler(options) {
  return new Bundler(utils.merge({}, defaultOptions.bundler, options));
}

function setContext(ctx) {
  if (!(ctx instanceof Context)) {
    logger.error("Context was not returned after bundling");
  }

  this.context = ctx;
  return ctx;
}

function initWatch(ctx) {
  if (this.options.watch && !this.watching) {
    this.watching = true;
    watch(ctx, this.options.watch);
  }

  return ctx;
}

function configureLogger(options, Logger) {
  if (options) {
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

    Logger.enableAll();
    Logger.level(Logger.levels[options.level || "info"]);

    if (options.stream) {
      Logger.pipe(options.stream);
    }
  }
  else {
    Logger.disable();
  }
};

Runner.dest = bundleWriter;
Runner.watch = watch;
Runner.Context = Context;
Runner.File = File;
module.exports = Runner;
