var es = require("event-stream");
var filesize = require("filesize");
var prettyHrtime = require("pretty-hrtime");
var ora = require("ora");

function buildstatsStreamFactory() {
  var startTime, spinner;

  return es.map(function(chunk, callback) {
    if (chunk.name === "bundler/context") {
      if (chunk.data[0] === "build-start") {
        spinner = ora({
          text: "do not disturb... build in progress",
          spinner: "bouncingBall"
        }).start();

        startTime = process.hrtime();
      }
      else if (chunk.data[0] === "build-end") {
        spinner.stop();
        process.stdout.write("build time: " + prettyHrtime(process.hrtime(startTime)) + "\n");

        var context = chunk.data[1];

        if (context.bundle && context.bundle.result && context.bundle.modules.length) {
          process.stdout.write("bundle: " + filesize(context.bundle.result.length) + "\n");
        }

        Object
          .keys(context.parts)
          .filter(function(dest) {
            return context.parts[dest];
          })
          .forEach(function(dest) {
            process.stdout.write("bundle part " + "[" + dest + "]: " + filesize(context.parts[dest].result.length) + "\n");
          });
      }
    }

    callback(null, chunk);
  });
}

module.exports = buildstatsStreamFactory;
