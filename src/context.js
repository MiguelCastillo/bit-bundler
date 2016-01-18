var utils = require("belty");
var types = require("dis-isa");

var defaults = {
  file: null,
  bundle: null,
  cache: {},
  exclude: [],
  modules: [],
  parts: {}
};

function Context(options) {
  if (!(this instanceof Context)) {
    return new Context(options);
  }

  utils.merge(this, defaults, options);
}

Context.prototype.configure = function(options) {
  if (!options || this === options) {
    return this;
  }

  return new Context(utils.extend({}, this, options));
};

Context.prototype.setFile = function(file) {
  return this.configure({
    file: file
  });
};

Context.prototype.setBundle = function(bundle) {
  return this.configure({
    bundle: bundle
  });
};

Context.prototype.addPart = function(name, part) {
  var parts = utils.extend({}, this.parts);
  parts[name] = part;

  return this.configure({
    parts: parts
  });
};

Context.prototype.removePart = function(name) {
  var parts = utils.extend({}, this.parts);
  delete parts[name];

  return this.configure({
    parts: parts
  });
};

Context.prototype.addExclude = function(exclude) {
  if (!types.isArray(exclude)) {
    exclude = [exclude];
  }

  exclude = this.exclude
    .concat(exclude)
    .reduce(function(container, item) {
      container[item] = true;
      return container;
    }, {});

  return this.configure({
    exclude: Object.keys(exclude)
  });
};

module.exports = Context;
