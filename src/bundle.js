var configurator = require("setopt")();

function Bundle(name, options, main) {
  this.name = name;
  this.main = !!main;
  configurator.configure(this, options);
}

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
