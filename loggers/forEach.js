var es = require("event-stream");

function forEachStreamFactory(cb) {
  return es.through(function(chunk) {
    cb(chunk);
    this.emit("data", chunk);
  });
}

module.exports = forEachStreamFactory;
