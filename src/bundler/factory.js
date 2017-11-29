var utils = require("belty");
var Bundler = require("./index");
var defaultOptions = require("../deprecatedOptions")

function factory(options) {
  if (Array.isArray(options.bundler)) {
    options.bundler = {
      plugins: options.bundler
    };
  }

  var settings = Object.assign(utils.pick(options, ["umd", "sourceMap"]), defaultOptions.bundler, options.bundler);
  return new Bundler(settings);
}

module.exports = factory;
