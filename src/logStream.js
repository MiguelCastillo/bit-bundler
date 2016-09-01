var chalk = require("chalk");
var stream = require("stream");

var logStream = new stream.Transform({ objectMode: true });

logStream._transform = function(chunk, encoding, callback) {
  var s = this;

  var color = chunk.level === 1 ? chalk.green :
    chunk.level === 2 ? chalk.yellow :
    chunk.level === 3 ? chalk.red : chalk.blue;

  var msgs = Object.keys(chunk.data)
    .map(function(key) {
      var val = chunk.data[key];
      return typeof val === "string" ? val : JSON.stringify(val);
    });

  if (msgs.length) {
    s.push(color(">> [" + chunk.name + "] \n"));
    msgs.forEach(function(d) { s.push("  " + d + "\n"); });
  }

  callback();
};

logStream.pipe(process.stdout);

module.exports = logStream;
