var fs = require("fs");
var path = require("path");
var mkdirp = require("mkdirp");
var types = require("dis-isa");
var loggerFactory = require("./logger");
var logger = loggerFactory.create("bundler/build");

function bundleWriter() {
  return function writerDelegate(context) {
    var file = context.file;
    var pending = [];

    context.visitBundles(function(bundle, dest, isMain) {
      if (bundle.content && dest) {
        pending.push(writeBundle(logger, bundle, streamFactory(dest)));
      }

      logger.log(bundle.content ? "bundle" : "empty-bundle", bundle, isMain);
      return bundle;
    });

    return Promise.all(pending).then(function() { return context;});
  };
}

function writeBundle(logger, bundle, stream) {
  if (!bundle || !bundle.content || !stream) {
    return Promise.resolve();
  }

  return new Promise(function(resolve, reject) {
    stream.write(bundle.content, function(err) {
      if (err) {
        logger.error("write-failure", bundle, err);
        reject(err);
      }
      else {
        logger.log("write-success", bundle);
        resolve();
      }
    });
  });
}

function fileStream(dest) {
  mkdirp.sync(path.dirname(dest));
  return fs.createWriteStream(dest);
}

function streamFactory(dest) {
  if (types.isFunction(dest)) {
    dest = dest();
  }

  return types.isString(dest) ? fileStream(dest) : dest;
}

bundleWriter.stream = streamFactory;
module.exports = bundleWriter;
