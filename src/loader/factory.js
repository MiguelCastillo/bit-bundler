const optionsParser = require("./options");
const Loader = require("./index");
const LoaderPool = require("./pool");

function factory(options) {
  const settings = optionsParser(options);
  return settings.multiprocess ? new LoaderPool(settings) : new Loader(settings);
}

module.exports = factory;
