var chalk = require("chalk");
var es = require("event-stream");
var messageBuilder = require("./messageBuilder");

function verboseStreamFactory() {
  return es.map(function(chunk, callback) {
    var msgs = messageBuilder(chunk);

    var color = (
      chunk.level === 1 ? chalk.green :
      chunk.level === 2 ? chalk.yellow :
      chunk.level === 3 ? chalk.red :
      chalk.blue
    );

    if (msgs.length) {
      console.log(color(">> [" + chunk.name + "]"));
      msgs.forEach(function(d) { console.log("  " + d); });
      console.log("");
    }

    callback(null, chunk);
  });
}

module.exports = verboseStreamFactory;
