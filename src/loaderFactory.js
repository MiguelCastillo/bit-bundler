var Loader = require("./loader");
var LoaderPool = require("./loaderPool");

function loaderFactory(options) {
  return options.multiprocess ? new LoaderPool(options) : new Loader(options);
}

module.exports = loaderFactory;
