var es = require("event-stream");
var filesize = require("filesize");
var prettyHrtime = require("pretty-hrtime");
var ora = require("ora");
var chalk = require("chalk");
var logSymbols = require("./logSymbols");
var messageBuilder = require("./messageBuilder");
var warnings = require("./warnings");

var FAILED = 0;
var SUCCESS = 1;
var NOMSG = null;

function buildstatsStreamFactory(options) {
  var logEnabled = !(options === false);
  var settings = options || {};
  var startTime, spinner;

  return es.map(function(chunk, callback) {
    if (isBuildStart(chunk)) {
      spinner = createSpinner("build in progress").start();
      startTime = process.hrtime();
    }
    else if (isBuildSuccess(chunk)) {
      finishSpinner(nextSpinner(spinner, "build success", startTime, SUCCESS).start(), startTime, SUCCESS);
    }
    else if (isBuildFailure(chunk)) {
      finishSpinner(nextSpinner(spinner, "build error", startTime, SUCCESS).start(), startTime, FAILED);
    }
    else if (isBuildBundling(chunk)) {
      spinner = nextSpinner(spinner, "creating bundles", startTime, SUCCESS).start();
    }
    else if (isBuildWriting(chunk)) {
      spinner = nextSpinner(spinner, "writing bundles", startTime, SUCCESS).start();
    }
    else if (isBuildInfo(chunk)) {
      infoSpinner(spinner, chunk.data[1], startTime, chunk.level);
    }
    else if (isBundleWriteSuccess(chunk)) {
      var bundle = chunk.data[1];
      infoSpinner(spinner, chalk.cyan(logSymbols.package) + "  [" + bundle.name + "] " + filesize(bundle.content.length));
    }
    else if (logEnabled && chunk.level >= 2) {
      logChunk(spinner, chunk);
    }

    callback(null, chunk);
  });
}

function isBundleWriteSuccess(chunk) {
  return chunk.name === "bundler/build" && chunk.data[0] === "write-success";
}

function isBuildStart(chunk) {
  return chunk.name === "bundler/build" && chunk.data[0] === "build-start";
}

function isBuildSuccess(chunk) {
  return chunk.name === "bundler/build" && chunk.data[0] === "build-success";
}

function isBuildBundling(chunk) {
  return chunk.name === "bundler/build" && chunk.data[0] === "build-bundling";
}

function isBuildWriting(chunk) {
  return chunk.name === "bundler/build" && chunk.data[0] === "build-writing";
}

function isBuildFailure(chunk) {
  return chunk.name === "bundler/build" && chunk.data[0] === "build-failure";
}

function isBuildInfo(chunk) {
  return chunk.data[0] === "build-info";
}

function logChunk(spinner, chunk) {
  messageBuilder(chunk)
    .filter(function(message) {
      return message;
    })
    .forEach(function(message) {
      infoSpinner(spinner, message);
    });
}

function infoSpinner(spinner, text, htime, level) {
  text = htime ? text + " " + prettyHrtime(process.hrtime(htime)) : text;
  spinner.clear();
  writeSpinner(spinner, text, level);
  spinner.render();
}

function writeSpinner(spinner, text, level) {
  var spacer = "  ";

  switch(level) {
    case 1:
      spinner.stream.write(logSymbols.info + spacer + text + "\n");
      break;
    case 2:
      spinner.stream.write(logSymbols.warning + spacer + text + "\n");
      break;
    case 3:
      spinner.stream.write(logSymbols.error + spacer + text + "\n");
      break;
    default:
      spinner.stream.write(spacer + text + "\n");
      break;
  }

  return spinner;
}

function createSpinner(text) {
  return text && ora({
    text: text,
    spinner: "dots"
  });
}

function nextSpinner(prevSpinner, text, htime, success) {
  finishSpinner(prevSpinner, htime, success);
  return createSpinner(text);
}

function finishSpinner(spinner, htime, success) {
  var text = spinner.text + ": " + prettyHrtime(process.hrtime(htime));
  success = success === undefined ? SUCCESS : success;
  success === FAILED ? spinner.fail(text) : spinner.succeed(text);
}


module.exports = buildstatsStreamFactory;
