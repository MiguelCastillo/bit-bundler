var fs = require("fs");
var path = require("path");
var mkdirp = require("mkdirp");
var types = require("dis-isa");
var loggerFactory = require("./logger");
var logger = loggerFactory.create("bundler/build");

function bundleWriter(defaultDest) {
  return function writerDelegate(context) {
    var file = context.file;

    var pending = Object
      .keys(context.shards)
      .map(processShard)
      .concat(writeBundle(logger, context.bundle, streamFactory(file.dest || defaultDest)));

    return Promise.all(pending).then(function() { return context;});

    function processShard(dest) {
      var shard = context.shards[dest];

      if (!shard || !shard.content) {
        logger.log("empty-bundle", dest);
        return;
      }

      return writeBundle(logger, shard, streamFactory(dest));
    }
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
