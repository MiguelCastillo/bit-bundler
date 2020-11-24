var es = require("event-stream");
var logger = require("../src/logging");

function levelFilter(level) {
  level = logger.levels[level];

  return es.map(function(chunk, callback) {
    if (chunk.level >= level) {
      callback(null, chunk);
    }
    else {
      callback();
    }
  });
}

module.exports = levelFilter;
