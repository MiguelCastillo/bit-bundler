var chalk = require("chalk");
var es = require("event-stream");
var messageBuilder = require("./messageBuilder");

function watchStreamFactory() {
  return es.map(function(chunk, callback) {
    if (chunk.name === "bundler/watch") {
      var color = (
        chunk.level === 1 ? chalk.green :
        chunk.level === 2 ? chalk.yellow :
        chunk.level === 3 ? chalk.red :
        chalk.blue
      );

      var msgs = messageBuilder(chunk);

      if (msgs.length) {
        console.log(color(">> [" + chunk.name + "]"), msgs.join(" - "));
      }
    }

    callback(null, chunk);
  });
}

module.exports = watchStreamFactory;
