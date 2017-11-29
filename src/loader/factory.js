var Loader = require("./index");
var LoaderPool = require("./pool");

function loaderFactory(options) {
  return options.multiprocess ? new LoaderPool(options) : new Loader(options);
}

module.exports = loaderFactory;
