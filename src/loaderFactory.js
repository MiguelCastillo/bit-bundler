var Loader = require("./loader");
var LoaderProcClient = require("./loaderProcClient");

function loaderFactory(options) {
  return options.multiprocess ? new LoaderProcClient(options) : new Loader(options);
}

module.exports = loaderFactory;
