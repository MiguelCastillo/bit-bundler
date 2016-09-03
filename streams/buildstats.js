var es = require("event-stream");

function buildstatsStreamFactory() {
  var startChunk;

  return es.map(function(chunk, callback) {
    if (chunk.name === "bundler/context") {
      if (chunk.data[0] === "build-start") {
        startChunk = chunk;
      }
      else if (chunk.data[0] === "build-end") {
        console.log("build time: " + (chunk.date - startChunk.date) + "ms");
      }
    }

    callback(null, chunk);
  });
}

module.exports = buildstatsStreamFactory;
