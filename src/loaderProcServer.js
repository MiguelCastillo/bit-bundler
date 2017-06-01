var Loader = require("./loader");
var loader;

module.exports = {
  "init": function(options, next) {
    loader = new Loader(options);
    next();
  },
  "resolve": function(data) {
    return loader.resolve(data.name, data.referrer);
  },
  "fetch": function(data) {
    return loader.fetch(data.name, data.referrer);
  },
  "fetchShallow": function(data) {
    return loader.fetchShallow(data.name, data.referrer);
  }
};
