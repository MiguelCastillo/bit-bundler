var es = require("event-stream");
var filesize = require("filesize");
var prettyHrtime = require("pretty-hrtime");
var ora = require("ora");
var chalk = require("chalk");
var logSymbols = require("./logSymbols");
var messageBuilder = require("./messageBuilder");
var logger = require("../src/logging");
var overrideStreamWrite = require("./overrideStreamWrite");

var FAILED = 0;
var SUCCESS = 1;

function buildstatsStreamFactory(options) {
  var logEnabled = !(options === false);
  var settings = options || {};
  var level = logger.levels[settings.level || "warn"];
  var stdoutOverride = createStreamOverride(process.stdout).override();
  var stderrOverride = createStreamOverride(process.stderr).override();
  var startTime, spinner;

  return es.through(function(chunk) {
    stdoutOverride.restore();
    stderrOverride.restore();

    if (isBuildStart(chunk)) {
      startTime = process.hrtime();
      spinner = createSpinner("build in progress").start();
    }
    else if (isBuildSuccess(chunk)) {
      finishSpinner(nextSpinner(spinner, "build success", startTime, SUCCESS).start(), startTime, SUCCESS);
      spinner = null;
    }
    else if (isBuildFailure(chunk)) {
      finishSpinner(nextSpinner(spinner, "build error", startTime, SUCCESS).start(), startTime, FAILED);
      spinner = null;
    }
    else if (isBuildBundling(chunk)) {
      spinner = nextSpinner(spinner, "creating bundles", startTime, SUCCESS).start();
    }
    else if (isBuildWriting(chunk)) {
      spinner = nextSpinner(spinner, "writing bundles", startTime, SUCCESS).start();
    }
    else if (isBuildInfo(chunk)) {
      writeSpinner(spinner, chunk.data[1], startTime, chunk.level);
    }
    else if (isBundleWriteSuccess(chunk)) {
      var bundle = chunk.data[1];
      writeSpinner(spinner, chalk.cyan(logSymbols.package) + "  [" + bundle.name + "] " + filesize(bundle.content.length));
    }
    else {
      if (logEnabled && chunk.level >= level) {
        logChunk(spinner, chunk);
      }
    }

    stdoutOverride.override();
    stderrOverride.override();
    this.emit("data", chunk);
  });

  function createStreamOverride(stream) {
    return overrideStreamWrite(stream, function(data, encoding, cb) {
      if (spinner) {
        writeSpinner(spinner, data, null, 4);
      }
      else {
        stream.write(data, encoding, cb);
      }
    });
  }
}

function isBuildStart(chunk) {
  return chunk.name === "bundler/build" && chunk.data[0] === "build-start";
}

function isBundleWriteSuccess(chunk) {
  return chunk.name === "bundler/build" && chunk.data[0] === "write-success";
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
    .filter(Boolean)
    .forEach(function(message) {
      writeSpinner(spinner, message);
    });
}

function writeSpinner(spinner, text, htime, level) {
  text = htime ? text + " " + prettyHrtime(process.hrtime(htime)) : text;

  if (!spinner || !spinner.isEnabled) {
    writeStream(process.stdout, text, level);
  }
  else {
    spinner.clear();
    writeStream(spinner.stream, text, level);
  }
}

function writeStream(stream, text, level) {
  var spacer = "  ";

  switch(level) {
    case 1:
      stream.write(logSymbols.info + spacer + text + "\n");
      break;
    case 2:
      stream.write(logSymbols.warning + spacer + text + "\n");
      break;
    case 3:
      stream.write(logSymbols.error + spacer + text + "\n");
      break;
    case 4:
      stream.write(text);
      break;
    default:
      stream.write(spacer + text + "\n");
      break;
  }
}

function createSpinner(text) {
  return ora({
    stream: process.stdout,
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
