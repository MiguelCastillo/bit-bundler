var chalk = require("chalk");
var es = require("event-stream");
var messageBuilder = require("./messageBuilder");
var logger = require("../src/logging");

function verboseStreamFactory() {
  return es.through(function(chunk) {
    var msgs = messageBuilder(chunk);

    var color = (
      chunk.level === logger.levels.info ? chalk.green :
      chunk.level === logger.levels.warn ? chalk.yellow :
      chunk.level === logger.levels.error ? chalk.red :
      chalk.blue
    );

    process.stdout.write(color("[" + chunk.name + "] "));
    process.stdout.write(msgs.length ? msgs.join("\n") + "\n" : "\n");
    this.emit("data", chunk);
  });
}

module.exports = verboseStreamFactory;
