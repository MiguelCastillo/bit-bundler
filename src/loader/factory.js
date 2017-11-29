const utils = require("belty");
const Loader = require("./index");
const LoaderPool = require("./pool");
const defaultOptions = require("../deprecatedOptions")

function factory(options) {
  if (Array.isArray(options.loader)) {
    options.loader = {
      plugins: options.loader
    };
  }

  var settings = Object.assign(utils.pick(options, ["stubNotFound", "sourceMap", "baseUrl", "multiprocess"]), defaultOptions.loader, options.loader);
  return settings.multiprocess ? new LoaderPool(settings) : new Loader(settings);
}

module.exports = factory;
