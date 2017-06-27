var chalk = require("chalk");
var es = require("event-stream");
var messageBuilder = require("./messageBuilder");
var logger = require("../src/logger");

function verboseStreamFactory() {
  return es.through(function(chunk) {
    var msgs = messageBuilder(chunk);

    var color = (
      chunk.level === logger.levels.info ? chalk.green :
      chunk.level === logger.levels.warn ? chalk.yellow :
      chunk.level === logger.levels.error ? chalk.red :
      chalk.blue
    );

    if (msgs.length) {
      process.stderr.write(color(">> [" + chunk.name + "]"));
      msgs.forEach(function(d) { process.stderr.write("  " + d + "\n"); });
      process.stderr.write("\n");
    }

    this.emit("data", chunk);
  });
}

module.exports = verboseStreamFactory;
