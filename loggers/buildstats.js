var es = require("event-stream");
var filesize = require("filesize");
var prettyHrtime = require("pretty-hrtime");
var ora = require("ora");
var warnings = require("./warnings");

function buildstatsStreamFactory(options) {
  options = options || {};
  var startTime, spinner;
  var animation = options.animation !== false;

  return es.map(function(chunk, callback) {
    if (isBuildStart(chunk)) {
      if (animation) {
        spinner = ora({
          text: "build in progress",
          spinner: "dots"
        });

        spinner.start();
      }
      else {
        process.stdout.write("build in progress...\n");
      }

      startTime = process.hrtime();
    }
    else if (isBuildSuccess(chunk)) {
      if (spinner) {
        spinner.text = "build success";
        spinner.succeed();
      }

      process.stdout.write("build time: " + prettyHrtime(process.hrtime(startTime)) + "\n");
      logBundleDetails(getData(chunk));
    }
    else if (isBuildFailure(chunk)) {
      if (spinner) {
        spinner.text = "build failed";
        spinner.fail();
      }

      process.stdout.write("build time: " + prettyHrtime(process.hrtime(startTime)) + "\n");
    }

    if (warnings.hasWarningsOrErrors(chunk)) {
      if (spinner) {
        spinner.clear();
      }

      warnings.logWarningsAndErrors(chunk, { showName: false });
    }

    callback(null, chunk);
  });
}

function getData(chunk) {
  return chunk.data[1];
}

function isBuildStart(chunk) {
  return chunk.name === "bundler/context" && chunk.data[0] === "build-start";
}

function isBuildSuccess(chunk) {
  return chunk.name === "bundler/context" && chunk.data[0] === "build-success";
}

function isBuildFailure(chunk) {
  return chunk.name === "bundler/context" && chunk.data[0] === "build-failed";
}

function logBundleDetails(context) {
  if (context.bundle && context.bundle.result && context.bundle.modules.length) {
    process.stdout.write("bundle: " + filesize(context.bundle.result.length) + "\n");
  }

  Object
    .keys(context.shards)
    .filter(function(dest) {
      return context.shards[dest];
    })
    .forEach(function(dest) {
      process.stdout.write("bundle shard " + "[" + dest + "]: " + filesize(context.shards[dest].result.length) + "\n");
    });
}

module.exports = buildstatsStreamFactory;
