var utils = require("belty");
var Bundler = require("./index");

function factory(options) {
  if (Array.isArray(options.bundler)) {
    options.bundler = {
      plugins: options.bundler
    };
  }

  var settings = Object.assign(utils.pick(options, ["umd", "sourceMap"]), options.bundler);
  return new Bundler(settings);
}

module.exports = factory;
