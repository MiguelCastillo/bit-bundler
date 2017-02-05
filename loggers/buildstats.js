var es = require("event-stream");
var filesize = require("filesize");
var prettyHrtime = require("pretty-hrtime");
var ora = require("ora");
var chalk = require('chalk');
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
      if (animation) {
        spinner = nextSpinner("build in progress").start();
      }

      startTime = process.hrtime();
    }
    else if (isBuildSuccess(chunk)) {
      var msg = "build success";

      if (spinner) {
        finishSpinner(nextSpinner(msg, spinner, startTime, SUCCESS), startTime, SUCCESS);
      }
    }
    else if (isBuildFailure(chunk)) {
      var msg = chalk.red("build error");

      if (spinner) {
        finishSpinner(nextSpinner(msg, spinner, startTime, SUCCESS), startTime, FAILED);
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
        var msg = (
          chunk.level === 1 ? chalk.cyan("ⓘ  " + chunk.data[1])  :
          chunk.level === 2 ? chalk.green("ⓦ  " + chunk.data[1]) :
          chunk.level === 3 ? chalk.red("ⓔ  " + chunk.data[1]) : chunk.data[1]
        );

        infoSpinner(msg, startTime);
      }
    }
    else if (isBundleWriteSuccess(chunk)) {
      if (spinner) {
        spinner.clear();
      }

      var bundle = chunk.data[1];
      infoSpinner(chalk.cyan("📦  ") + "[" + bundle.name + "] " + filesize(bundle.content.length));

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
  finishSpinner(prevSpinner, htime, success);

  return text && ora({
    text: text,
    spinner: "dots"
  });
}

function infoSpinner(text, htime) {
  text = htime ? text + " " + prettyHrtime(process.hrtime(htime)) : text;

  ora({
    text: text,
    spinner: "dots"
  })
  .stopAndPersist();
}

function finishSpinner(spinner, htime, success) {
  if (spinner) {
    spinner.text = spinner.text + ": " + prettyHrtime(process.hrtime(htime));
    success = success === undefined ? SUCCESS : success;
    success === FAILED ? spinner.fail() : spinner.succeed();
  }
}
