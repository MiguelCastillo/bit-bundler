var fs = require("fs");
var path = require("path");
var mkdirp = require("mkdirp");
var types = require("dis-isa");

function bundleWriter(dest) {
  var stream = streamFactory(dest);

  return function writerDelegate(context) {
    var file = context.file;

    Object
      .keys(context.parts)
      .map(function(dest) {
        if (!context.parts[dest]) {
          console.log(dest, "is an empty bundle part");
        }

        if (context.parts[dest]) {
          writeBundle(context.parts[dest], stream(dest));
        }
      });

    if (context.bundle) {
      writeBundle(context.bundle, stream(file.dest));
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
  return function streamFactoryDelegate(out) {
    out = out || dest;

    if (types.isFunction(out)) {
      out = out();
    }

    return types.isString(out) ? fileStream(out) : out;
  };
}

module.exports = bundleWriter;
