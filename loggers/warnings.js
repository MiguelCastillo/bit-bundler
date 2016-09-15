var chalk = require("chalk");
var es = require("event-stream");
var messageBuilder = require("./messageBuilder");

function warningsStreamFactory() {
  return es.map(function(chunk, callback) {
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

    callback(null, chunk);
  });
}

module.exports = warningsStreamFactory;
