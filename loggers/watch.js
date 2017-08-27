var chalk = require("chalk");
var es = require("event-stream");
var messageBuilder = require("./messageBuilder");

function watchStreamFactory() {
  return es.through(function(chunk) {
    if (chunk.name === "bundler/watch") {
      var color = (
        chunk.level === 1 ? chalk.green :
        chunk.level === 2 ? chalk.yellow :
        chunk.level === 3 ? chalk.red :
        chalk.blue
      );

      var msgs = messageBuilder(chunk);
      if (msgs.length) {
        process.stdout.write(color(">> [" + chunk.name + "] ") + msgs.join(" - ") + "\n");
      }
    }

    this.emit("data", chunk);
  });
}

module.exports = watchStreamFactory;
