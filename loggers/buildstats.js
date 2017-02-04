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
      var msg = "build success: " + prettyHrtime(process.hrtime(startTime));

      if (spinner) {
        spinner.text = msg;
        spinner.succeed();
      }
      else {
        process.stdout.write(msg + "\n");
      }
    }
    else if (isBuildFailure(chunk)) {
      var msg = "build error: " + prettyHrtime(process.hrtime(startTime));

      if (spinner) {
        spinner.text = msg;
        spinner.fail();
      }
      else {
        process.stdout.write(msg + "\n");
      }
    }
    else if (isBundleWriteSuccess(chunk)) {
      if (spinner) {
        spinner.clear();
      }

      var bundle = chunk.data[1];
      process.stdout.write("bundle: [" + bundle.name + "] " + filesize(bundle.content.length) + "\n");
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
  var data = chunk.data.slice(2).map(function(data) {
    return "  " + data;
  });

  return [chunk.data[0]].concat(data).join("");
}

function isBundleWriteSuccess(chunk) {
  return chunk.name === "bundler/writer" && chunk.data[0] === "write-success";
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

module.exports = buildstatsStreamFactory;
