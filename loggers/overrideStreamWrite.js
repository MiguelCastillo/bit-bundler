module.exports = function(stream, redirect) {
  var _write = null;
  var _canChange = true;

  var _instance = {
    restore: restore,
    override: override
  };

  return _instance;

  function handler(data, encoding, cb) {
    if (typeof encoding === "function") {
      cb = encoding;
      encoding = null;
    }

    restore();
    _canChange = false;
    redirect.call(stream, data, encoding);
    _canChange = true;
    override();

    if (typeof cb === "function") {
      cb();
    }
  };

  function restore() {
    if (_canChange) {
      stream.write = _write;
      _write = null;
    }

    return _instance;
  }

  function override() {
    if (_canChange) {
      _write = stream.write;
      stream.write = handler;
    }

    return _instance;
  }
};
