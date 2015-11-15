var logger  = require("loggero").create("bundler/fileReader");
var fs      = require("fs");
var pstream = require("p-stream");


/**
 * Function that reads file from disk
 *
 * @param {object} moduleMeta - Module meta with information about the module being loaded
 */
function fileReader(moduleMeta) {
  function setSource(text) {
    return {
      source: text
    };
  }

  function logError(err) {
    logger.error(moduleMeta.path, err);
    throw err;
  }

  return pstream(readFile(moduleMeta.path)).then(setSource, logError);
}


/**
 * Read file from storage. You can very easily replace this with a routine
 * that loads data using XHR.
 *
 * @private
 *
 * @param {string} filePath - Full path for the file to be read
 *
 * @returns {Promise}
 */
function readFile(filePath) {
  return fs
    .createReadStream(filePath)
    .setEncoding("utf8");
}


module.exports = fileReader;
