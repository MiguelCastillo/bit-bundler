var es = require("event-stream");

function through(cb) {
  return es.through(cb);
}

function sequence() {
  var s = through();
  Array.prototype.slice.apply(arguments).reduce(function(prev, stream) {
    return prev.pipe(stream);
  }, s);
  return s;
};

function forEach(cb) {
  return through(function(chunk) {
    cb(chunk);
    this.emit("data", chunk);
  });
}

module.exports = {
  sequence: sequence,
  through: through,
  forEach: forEach
};
