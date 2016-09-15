var es = require("event-stream");
var filesize = require("filesize");
var prettyHrtime = require("pretty-hrtime");
var ora = require("ora");
var warnings = require("./warnings");

function buildstatsStreamFactory(options) {
  options = options || {};
  var startTime, spinner;
  var animation = options.animation;

  return es.map(function(chunk, callback) {
    if (chunk.name === "bundler/context") {
      if (chunk.data[0] === "build-start") {

        if (animation) {
          spinner = ora({
            text: "do not disturb... build in progress",
            spinner: "bouncingBall"
          }).start();
        }
        else {
          process.stdout.write("build started...\n");
        }

        startTime = process.hrtime();
      }
      else if (chunk.data[0] === "build-success") {
        if (spinner) {
          spinner.stop();
        }

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
      else if (chunk.data[0] === "build-failed") {
        if (spinner) {
          spinner.stop();
        }

        process.stdout.write("build time: " + prettyHrtime(process.hrtime(startTime)) + "\n");
      }

      warnings.logWarningsAndErrors(chunk);
    }

    callback(null, chunk);
  });
}

module.exports = buildstatsStreamFactory;
