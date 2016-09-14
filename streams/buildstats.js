var es = require("event-stream");
var filesize = require("filesize");
var prettyHrtime = require("pretty-hrtime");

function buildstatsStreamFactory() {
  var startTime;

  return es.map(function(chunk, callback) {
    if (chunk.name === "bundler/context") {
      if (chunk.data[0] === "build-start") {
        startTime = process.hrtime();
      }
      else if (chunk.data[0] === "build-end") {
        console.log("build time:", prettyHrtime(process.hrtime(startTime)));

        var context = chunk.data[1];

        if (context.bundle && context.bundle.result && context.bundle.modules.length) {
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
