var es = require("event-stream");

function getchunkStreamFactory(cb) {
  return es.map(function(chunk, callback) {
    cb(chunk);
    callback(null, chunk);
  });
}

module.exports = getchunkStreamFactory;
