var chalk = require("chalk");
var es = require("event-stream");
var messageBuilder = require("./messageBuilder");

function warningsStreamFactory(options) {
  return es.map(function(chunk, callback) {
    logWarningsAndErrors(chunk, options);
    callback(null, chunk);
  });
}

function logWarningsAndErrors(chunk, options) {
  options = options || {};
  var color = (
    chunk.level === 2 ? chalk.yellow :
    chunk.level === 3 ? chalk.red : null
  );

  if (color) {
    var msgs = messageBuilder(chunk);

    if (msgs.length) {
      if (chunk.name && options.showName !== false) {
        process.stderr.write(color(">> [" + chunk.name + "]") + "\n");
      }

      msgs.forEach(function(d) { process.stderr.write("  " + d + "\n"); });
      process.stderr.write("\n");
    }
  }
}

function hasWarningsOrErrors(chunk) {
  return chunk.level === 2 || chunk.level === 3;
}

warningsStreamFactory.hasWarningsOrErrors = hasWarningsOrErrors;
warningsStreamFactory.logWarningsAndErrors = logWarningsAndErrors;
module.exports = warningsStreamFactory;
