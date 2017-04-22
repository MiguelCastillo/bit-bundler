var es = require("event-stream");

function getchunkStreamFactory(cb) {
  return es.through(function(chunk) { cb(chunk); });
}

module.exports = getchunkStreamFactory;
