var logger = require("loggero").create("bundler/resolvePath");
var browserResolve = require("browser-resolve");


function getDirectory(path) {
  return path.replace(/([^/]+)$/gmi, function() {return "";});
}


/**
 * Resolves the path for the moduleMeta object.  It uses process.cwd as the baseUrl
 */
function resolver(moduleMeta) {
  return resolve(moduleMeta, {baseUrl: process.cwd()});
}


/**
 * Configurator for resolver. This will create and return a resolve function to be
 * called with the moduleMeta, which will be processed with the options passed in
 * when configure was called.
 */
resolver.configure = function(options) {
  options = options || {};

  if (!options.baseUrl) {
    options.baseUrl = process.cwd();
  }

  return function resolveDelegate(moduleMeta) {
    return resolve(moduleMeta, options);
  };
};


/**
 * Convert module name to full module path
 */
function resolve(moduleMeta, options) {
  function setPath(path) {
    if (path) {
      return {
        directory: getDirectory(path),
        path: path
      };
    }
  }

  function logError(err) {
    logger.error(moduleMeta.name, err);
    throw err;
  }

  return resolvePath(moduleMeta, options).then(setPath, logError);
}


/**
 * Figures out the path for the moduleMeta so that the module file can be loaded from storage.
 *
 * We use browser-resolve to do the heavy lifting for us, so all this module is really doing
 * is wrapping browser-resolve so that it can be used by bit loader in a convenient way.
 */
function resolvePath(moduleMeta, options) {
  var parentPath = getParentPath(moduleMeta, options);

  // Experimental use of app paths by name rather then path.  E.g.
  // require('app/test');
  // vs
  // require('./app/test);
  //
  //  var filePath = path.resolve(path.dirname(options.baseUrl), moduleMeta.name);
  //  var stat = fs.statSync(filePath);
  //
  //  if (stat.isFile()) {
  //    return Promise.resolve(filePath);
  //  }

  return new Promise(function(resolve) {
    browserResolve(moduleMeta.name, {filename: parentPath}, function(err, filePath) {
      resolve(filePath);
    });
  });
}


/**
 * Gets the path for the module requesting the moduleMeta being resolved. This is what
 * happens when a dependency is loaded.
 */
function getParentPath(moduleMeta, options) {
  var referrer = moduleMeta.referrer;
  return (referrer && moduleMeta !== referrer) ? referrer.path : options.baseUrl;
}


module.exports = resolver;
