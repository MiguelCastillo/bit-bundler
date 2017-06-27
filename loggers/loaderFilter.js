var utils = require("belty");
var es = require("event-stream");

function loaderFilter(items) {
  items = items ? utils.toArray(items) : ["service"];

  return es.map(function(chunk, callback) {
    var item = items.find(function(item) {
      return chunk.name.indexOf(item) !== -1;
    });

    if (item) {
      callback(null, chunk);
    }
    else {
      callback();
    }
  });
}

module.exports = loaderFilter;
