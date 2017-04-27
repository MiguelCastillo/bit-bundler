var chalk = require("chalk");
var es = require("event-stream");
var messageBuilder = require("./messageBuilder");

function warningsStreamFactory(options) {
  return es.through(function(chunk) {
    logWarningsAndErrors(chunk, options);
    this.emit("data", chunk);
  });
}

function logWarningsAndErrors(chunk, options) {
  options = options || {};
  var color = (
    chunk.level === 2 ? chalk.yellow :
    chunk.level === 3 ? chalk.red : null
  );

  if (color) {
    var messages = messageBuilder(chunk);

    if (messages.length) {
      if (chunk.name && options.showName !== false) {
        process.stderr.write(color(">> [" + chunk.name + "]") + "\n");
      }

      messages.forEach(function(message) { process.stderr.write("  " + message + "\n"); });
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
