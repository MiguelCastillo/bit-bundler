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

    this.options = Object.assign({
      baseUrl: process.cwd(),
    }, options);

    configureNotifications(this, this.options.notifications);
    configureLogger(this, this.options.log);

    this.context = null;
    this.loader = loaderFactory(this.options);
    this.bundler = bundlerFactory(this.options);
  }

  baseUrl() {
    return this.options.baseUrl;
  }

  bundle(inputFiles) {
    logger.log("build-init");

    const {entrypoint, bundle} = createMainBundle(inputFiles, this.baseUrl());
    this.context = new Context().setBundle(bundle);

    return this
      .update(entrypoint)
      .then((context) => {
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
      })
      .catch(ex => {
        if (this.options.multiprocess) {
          this.loader.pool.stop();
        }

        throw ex;
      });
  }

  update(inputFile) {
    logger.log("build-start");

    return this
      .buildBundles(inputFile)
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
      .catch((ex) => {
        if (ex) {
          process.stderr.write((ex && ex.stack ? ex.stack : ex) + "\n");
        }

        logger.error("build-failure", ex);
        logger.log("build-end");
        throw ex;
      });
  }

  buildBundles(inputFile) {
    // There are two way in which buildBundles runs.
    // 1. When we first kick off the bundling process. In this case, inputFile
    //    will be an entrypoint.
    // 2. When there is an update from file watching. In this case, inputFile
    //    will be a file path string.
    // getTargetsToBundle helps us get the right thing to bundle.
    const targets = getTargetsToBundle(inputFile);
    const context = this.context;
    const loader = this.loader;
    const bundler = this.bundler;

    // Clear up cached items that need to be reprocessed
    targets
      .filter(target => types.isString(target) && loader.hasModule(target))
      .map(target => loader.getModule(target))
      .forEach(mod => loader.deleteModule(mod));

    return loader
      .fetch(targets)
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

  getLogger(name) {
    return logging.create(name);
  }
}

Bitbundler.bundle = function(inputFiles, settings) {
  return new Bitbundler(settings).bundle(inputFiles);
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

function configureLogger(bitbundler, options) {
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

// Creates the root bundle where all things start from. If there are multiple
// bundles that need to be generated, then bundle splitting is the tool for
// the job.
function createMainBundle(inputFiles, baseUrl) {
  const entrypoint = createEntrypoint(inputFiles, baseUrl);
  const entries = entrypoint.src.map(src => {
    return types.isString(src) ? src : (src.id || src.path || "@anonymous-" + id++);
  });

  return {
    entrypoint: entrypoint,
    bundle: new Bundle("main", { dest: entrypoint.dest, entries: entries }, true),
  };
}

// createEntrypoint converts input files that need to be bundled to an
// entrypoint object with file paths to be bundled. An entrypoint is an object
// that contains three main bits of information.
// 1. src - all the file paths and module names to be loaded. file paths can
//    be globs, which are automatically expanded.
// 2. dest - where the generated bundle is going to be written to.
// 3. cwd - current working directory file paths are relative to.
//
// The goal of this function is to generate an entrypoint from all the
// different ways in which users can define files to be bundled.
//
// Files can have a few different shapes to make the API simpler to use. But it
// certainly makes the logic here much more complex so that we can handle
// all the different cases correctly.
//
// - A file can be a string, which case it is just a path to a single file to
//   bundle.
//
// - An object, which has three main bits of information: 1. src files for
//   bundling, dest where the bundle is to be written, and cwd that is the
//   current working directory for the input files.
//   The src can look like:
//   - A a string or an array of string file paths.
//     {"src": string | [string]}
//   - An object with a content property. Content is string of javascript code.
//     Often, content comes with a "path" property as well to specify a fake
//     path that is for resolving dependencies relative to in the javascript
//     content string.
//     {"content": string | Buffer, "path": string}
//
// - An array that can be a combination of string paths and/or content objects
//   as described above.
//
// TODO: add tests for createEntrypoint.
//
function createEntrypoint(inputFile, baseUrl) {
  // Check if input is a single path.
  if (types.isString(inputFile)) {
    return new File({
      src: [inputFile],
    }, baseUrl);
  }

  // If we have an array, if could either an array of strings and/or
  // content objects.
  else if (types.isArray(inputFile)) {
    return new File({
      src: inputFile.map(mapSource),
    }, baseUrl);
  }

  // Check if we have an object, which contains a src property
  else if (types.isPlainObject(inputFile)) {
    let src;

    if (inputFile.content || inputFile.path) {
      src = [utils.pick(inputFile, ["content", "path"])];
    }
    else if (inputFile.src) {
      src = [].concat(inputFile.src).map(mapSource);
    }
    else {
      invalidFormatError();
    }

    return new File(Object.assign({
        src: src,
      }, utils.pick(inputFile, ["cwd", "dest"])
    ), baseUrl);
  }

  // Ok, we do not have a valid input format. Let's just throw an error.
  else {
    invalidFormatError();
  }

  // Maps and validates src data.
  function mapSource(src) {
    if (types.isPlainObject(src)) {
      return utils.pick(src, ["content", "path"]);
    }

    if (types.isString(src)) {
      return src;
    }

    throw new Error("Invalid format for input file to bundle.");
  }

  function invalidFormatError() {
    throw new Error("Invalid format for input file to bundle.");
  }
}

// getTargetsToBundle returns an array of file paths and module names to bundle.
function getTargetsToBundle(inputFile) {
  if (inputFile instanceof File) {
    return inputFile.src;
  }

  if (types.isString(inputFile)) {
    return [inputFile];
  }

  if (types.isArray(inputFile)) {
    return inputFile;
  }

  throw new Error("Invalid file to bundle. It must be either a file path (string) or an entrypoint.");
}

Bitbundler.dest = bundleWriter;
Bitbundler.watch = watch;
Bitbundler.Context = Context;
Bitbundler.File = File;
module.exports = Bitbundler;
