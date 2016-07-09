function logError(err) {
  var errStr = err && err.stack || err;
  console.error(errStr);
  return err;
}

module.exports = logError;
