module.exports = function(stream, redirect) {
  var _write = null;

  var _instance = {
    restore: restore,
    override: override
  };

  return _instance;

  function handler(data, encoding, cb) {
    redirect.call(stream, data, encoding);

    if (typeof encoding === "function") {
      cb = encoding;
      encoding = null;
    }

    if (typeof cb === "function") {
      cb();
    }
  };

  function restore() {
    stream.write = _write;
    _write = null;
    return _instance;
  }

  function override() {
    _write = stream.write;
    stream.write = handler;
    return _instance;
  }
};
