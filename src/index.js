var umd_deps = require("deps-bits");
var Bitloader = require("bit-loader");
var Bundler = require("./bundler");
var fileReader = require("./fileReader");
var resolvePath = require("./resolvePath");
var utils = require("belty");
var defaultOptions = require("./defaultOptions");


function createLoader(options) {
  var loader = new Bitloader({
    resolve: resolvePath.configure({baseUrl: options.baseUrl}),
    fetch: fileReader,
    dependency: umd_deps,
    doNotIgnoreNodeModules: true
  });

  if (options.debug) {
    Bitloader.logger.enable();
  }

  return loader;
}


function createBundler(options) {
  options = utils.merge({}, defaultOptions, options);
  var loader = createLoader(options);
  return new Bundler(loader, options);
}


module.exports = createBundler;
