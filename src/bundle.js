var configurator = require("setopt")();
var utils = require("belty");

function Bundle(name, options, main) {
  this.name = name;

  Object.defineProperties(this, {
    "isMain": {
      value: !!main,
      writable: false
    }
  });

  configurator.configure(this, options);
}

Bundle.prototype.configure = function(options) {
  return !options || options === this ? this : new Bundle(this.name, utils.merge({}, this, options), this.main);
};

Bundle.prototype.clear = function() {
  return this.configure({ content: null, sourcemap: null });
};

Bundle.prototype.setDest = function(dest) {
  this.dest = dest;
  return this;
};

Bundle.prototype.setName = function(name) {
  this.name = name;
  return this;
};

Bundle.prototype.setContent = Bundle.prototype.setResult = function(result) {
  this.result = this.content = result;
  return this;
};

Bundle.prototype.setExports = function(exports) {
  this.exports = exports;
  return this;
};

Bundle.prototype.setModules = function(modules) {
  this.modules = modules;
  return this;
};

Bundle.prototype.setSourcemap = function(sourcemap) {
  this.sourcemap = sourcemap;
  return this;
};

module.exports = Bundle;
