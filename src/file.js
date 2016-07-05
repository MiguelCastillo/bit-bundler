var glob = require("glob");
var path = require("path");
var types = require("dis-isa");
var utils = require("belty");
var configurator = require("setopt")();
var _cwd = process.cwd();

function File(options, cwd) {
  if (!(this instanceof File)) {
    return new File(options);
  }

  if (!options) {
    options = {};
  }
  else if (types.isString(options)) {
    options = {
      src: options
    };
  }

  cwd = options.cwd || cwd || _cwd;
  cwd = _cwd === cwd || path.isAbsolute(cwd) ? cwd : path.join(_cwd, cwd);

  this.src = [];
  this.dest = null;
  this.cwd = cwd;
  configurator.configure(this, parseOptions(options));
}

File.prototype.setSrc = function(files) {
  this.src = src(files, this.cwd);
  return this;
};

File.prototype.setDest = function(file) {
  this.dest = dest(file, _cwd);
  return this;
};

function list(files, base) {
  return utils.toArray(files).map(function(file) {
    return new File(file, base);
  });
}

function src(files, base) {
  return utils.toArray(files).reduce(function(result, file) {
    var globResult = types.isString(file) ?
      glob.sync(file, { cwd: base, realpath: true }) :
      [file];

    return result.concat(globResult);
  }, []);
}

function dest(file, base) {
  return types.isString(file) ?
    path.isAbsolute(file) ? file : path.join(base, file) :
    file;
}

function parseOptions(options) {
  if (!options) {
    options = {};
  }
  else if (!types.isPlainObject(options)) {
    options = {
      src: options
    };
  }

  return options;
}

module.exports = File;
module.exports.list = list;
module.exports.src = src;
module.exports.dest = dest;
