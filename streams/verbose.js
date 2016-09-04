var chalk = require("chalk");
var es = require("event-stream");

function verboseStreamFactory() {
  return es.map(function(chunk, callback) {
    var msgs = messageBuilder(chunk);

    var color = chunk.level === 1 ? chalk.green :
      chunk.level === 2 ? chalk.yellow :
      chunk.level === 3 ? chalk.red :
      chalk.blue;

    if (msgs.length) {
      console.log(color(">> [" + chunk.name + "]"));
      msgs.forEach(function(d) { console.log("  " + d); });
      console.log("");
    }

    callback(null, chunk);
  });
}

function messageBuilder(chunk) {
  return Object
    .keys(chunk.data)
    .map(function(key) {
      var val = chunk.data[key];

      return typeof val === "string" ? val :
        Buffer.isBuffer(val) ? val.toString() :
        JSON.stringify(val);
    });
}

module.exports = verboseStreamFactory;
