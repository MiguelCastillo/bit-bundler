var logger = require("./logger").create("bundler/error-logger");

function logError(err) {
  var errStr = err && err.stack || err;
  logger.error(errStr);
  return err;
}

module.exports = logError;
