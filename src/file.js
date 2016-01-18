var path = require("path");
var types = require("dis-isa");
var configurator = require("./configurator")();

function File(options) {
  if (!(this instanceof File)) {
    return new File(options);
  }

  this.src = [];
  this.dest = null;
  configurator.configure(this, parseOptions(options));
}

File.prototype.setSrc = function(src) {
  this.src = this.src.concat(toArray(src));
  return this;
};

File.prototype.setDest = function(dest) {
  this.dest = dest;
  return this;
};

function parseOptions(options) {
  if (!types.isPlainObject(options)) {
    options = {
      src: options
    };
  }

  options.src = toArray(options.src).map(function(f) {
    return path.resolve(f);
  });

  return options;
}

function toArray(input) {
  if (!types.isArray(input)) {
    return [input];
  }
  return input;
}

module.exports = File;
