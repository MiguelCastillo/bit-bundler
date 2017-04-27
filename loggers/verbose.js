var chalk = require("chalk");
var es = require("event-stream");
var messageBuilder = require("./messageBuilder");

function verboseStreamFactory(level) {
  return es.through(function(chunk) {
    var msgs = messageBuilder(chunk);

    var color = (
      chunk.level === 1 ? chalk.green :
      chunk.level === 2 ? chalk.yellow :
      chunk.level === 3 ? chalk.red :
      chalk.blue
    );

    if (msgs.length && chunk.level >= level) {
      process.stderr(color(">> [" + chunk.name + "]"));
      msgs.forEach(function(d) { process.stderr("  " + d + "\n"); });
      process.stderr("\n");
    }

    this.emit("data", chunk);
  });
}

module.exports = verboseStreamFactory;
