const utils = require("belty");

module.exports = function(options) {
  if (Array.isArray(options.bundler)) {
    options.bundler = {
      plugins: options.bundler
    };
  }

  return Object.assign(utils.pick(options, ["umd", "sourceMap", "exportNames", "baseUrl"]), options.bundler);
};
