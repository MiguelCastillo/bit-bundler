const optionsParser = require("./options");
const Bundler = require("./index");

function factory(options) {
  const settings = optionsParser(options);
  return new Bundler(settings);
}

module.exports = factory;
