var chalk = require("chalk");
var es = require("event-stream");
var messageBuilder = require("./messageBuilder");

function warningsStreamFactory() {
  return es.map(function(chunk, callback) {
    logWarningsAndErrors(chunk);
    callback(null, chunk);
  });
}

function logWarningsAndErrors(chunk) {
  var color = (
    chunk.level === 2 ? chalk.yellow :
    chunk.level === 3 ? chalk.red : null
  );

  if (color) {
    var msgs = messageBuilder(chunk);

    if (msgs.length) {
      console.log(color(">> [" + chunk.name + "]"));
      msgs.forEach(function(d) { console.log("  " + d); });
      console.log("");
    }
  }
}

warningsStreamFactory.logWarningsAndErrors = logWarningsAndErrors;
module.exports = warningsStreamFactory;
