var es = require("event-stream");
var filesize = require("filesize");

function buildstatsStreamFactory() {
  var startChunk;

  return es.map(function(chunk, callback) {
    if (chunk.name === "bundler/context") {
      if (chunk.data[0] === "build-start") {
        startChunk = chunk;
      }
      else if (chunk.data[0] === "build-end") {
        console.log("build time:", (chunk.date - startChunk.date) + "ms");

        var context = chunk.data[1];

        if (context.bundle && context.bundle.result) {
          console.log("bundle:", filesize(context.bundle.result.length));
        }

        Object
          .keys(context.parts)
          .filter(function(dest) {
            return context.parts[dest];
          })
          .forEach(function(dest) {
            console.log("bundle part", "[" + dest + "]:", filesize(context.parts[dest].result.length));
          });
      }
    }

    callback(null, chunk);
  });
}

module.exports = buildstatsStreamFactory;
