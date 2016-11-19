var fs = require("fs");
var path = require("path");
var mkdirp = require("mkdirp");
var types = require("dis-isa");

function bundleWriter(defaultDest) {
  return function writerDelegate(context) {
    var file = context.file;
    var logger = context.getLogger("bundler/writer");

    var pending = Object
      .keys(context.shards)
      .map(function(dest) {
        if (context.shards[dest]) {
          return Promise.resolve(writeBundle(logger, context.shards[dest], streamFactory(dest)));
        }
        else {
          logger.log("bundle-empty", dest, "is an empty bundle");
        }
      });

    if (context.bundle) {
      pending.push(
        Promise.resolve(writeBundle(logger, context.bundle, streamFactory(file.dest || defaultDest)))
      );
    }

    return Promise.all(pending).then(function() {
      return context;
    });
  };
}

function writeBundle(logger, bundle, stream) {
  if (stream) {
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
