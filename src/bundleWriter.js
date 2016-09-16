var fs = require("fs");
var path = require("path");
var mkdirp = require("mkdirp");
var types = require("dis-isa");
var logger = require("loggero").create("bundler/writer");

function bundleWriter(defaultDest) {
  return function writerDelegate(context) {
    var file = context.file;

    Object
      .keys(context.shards)
      .forEach(function(dest) {
        if (!context.shards[dest]) {
          logger.log(dest, "is an empty bundle shard");
        }

        if (context.shards[dest]) {
          writeBundle(context.shards[dest], streamFactory(dest));
        }
      });

    if (context.bundle) {
      writeBundle(context.bundle, streamFactory(file.dest || defaultDest));
    }

    return context;
  };
}

function writeBundle(bundle, stream) {
  if (stream) {
    stream.write(bundle.result);
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
