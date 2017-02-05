var es = require("event-stream");
var filesize = require("filesize");
var prettyHrtime = require("pretty-hrtime");
var ora = require("ora");
var warnings = require("./warnings");

var FAILED = 0;
var SUCCESS = 1;
var NOMSG = null;

function buildstatsStreamFactory(options) {
  options = options || {};
  var startTime, spinner;
  var animation = options.animation !== false;

  return es.map(function(chunk, callback) {
    if (isBuildStart(chunk)) {
      var msg = "build in progress";

      if (animation) {
        spinner = nextSpinner(msg).start();
      }
      else {
        process.stderr.write(msg + "...\n");
      }

      startTime = process.hrtime();
    }
    else if (isBuildSuccess(chunk)) {
      var msg = "build success";

      if (spinner) {
        spinner = nextSpinner(msg, spinner, startTime, SUCCESS);
        nextSpinner(NOMSG, spinner, startTime, SUCCESS);
      }
      else {
        process.stdout.write(msg + ": "  + prettyHrtime(process.hrtime(startTime)) + "\n");
      }
    }
    else if (isBuildFailure(chunk)) {
      var msg = "build error";

      if (spinner) {
        spinner = nextSpinner(msg, spinner, startTime, SUCCESS);
        nextSpinner(NOMSG, spinner, startTime, FAILED);
      }
      else {
        process.stderr.write(msg + ": "  + prettyHrtime(process.hrtime(startTime)) + "\n");
      }
    }
    else if (isBuildBundling(chunk)) {
      if (spinner) {
        spinner = nextSpinner("creating bundles", spinner, startTime, SUCCESS).start();
      }
    }
    else if (isBuildWriting(chunk)) {
      if (spinner) {
        spinner = nextSpinner("writing bundles", spinner, startTime, SUCCESS).start();
      }
    }
    else if (isBuildInfo(chunk)) {
      if (spinner) {
        nextSpinner(NOMSG, nextSpinner(chunk.data[1]).start(), startTime, SUCCESS);
      }
    }
    else if (isBundleWriteSuccess(chunk)) {
      if (spinner) {
        spinner.clear();
      }

      var bundle = chunk.data[1];
      process.stderr.write("  |- bundle: [" + bundle.name + "] " + filesize(bundle.content.length) + "\n");

      if (spinner) {
        spinner.render();
      }
    }

    if (warnings.hasWarningsOrErrors(chunk)) {
      if (spinner) {
        spinner.clear();
      }

      warnings.logWarningsAndErrors(chunk, { showName: false });

      if (spinner) {
        spinner.render();
      }
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

function isBuildBundling(chunk) {
  return chunk.name === "bundler/context" && chunk.data[0] === "build-bundling";
}

function isBuildWriting(chunk) {
  return chunk.name === "bundler/context" && chunk.data[0] === "build-writing";
}

function isBuildFailure(chunk) {
  return chunk.name === "bundler/context" && chunk.data[0] === "build-failed";
}

function isBuildInfo(chunk) {
  return chunk.data[0] === "build-info";
}

module.exports = buildstatsStreamFactory;


function nextSpinner(text, prevSpinner, htime, success) {
  if (prevSpinner) {
    prevSpinner.text = prevSpinner.text + ": " + prettyHrtime(process.hrtime(htime));
    success = success === undefined ? SUCCESS : success;
    success === FAILED ? prevSpinner.fail() : prevSpinner.succeed();
  }

  return text && ora({
    text: text,
    spinner: "dots"
  });
}
