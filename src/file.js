var glob = require("glob");
var path = require("path");
var types = require("dis-isa");
var toArray = require("./toArray");
var configurator = require("./configurator")();
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

  var currCwd = options.cwd || cwd || _cwd;
  var baseDir = _cwd === currCwd ? currCwd : path.join(_cwd, currCwd);

  this.src = [];
  this.dest = null;
  this.cwd = currCwd;
  this.baseDir = baseDir;
  configurator.configure(this, parseOptions(options));
}

File.prototype.setSrc = function(files) {
  this.src = src(files, this.baseDir);
  return this;
};

File.prototype.setDest = function(file) {
  this.dest = dest(file, this.cwd);
  return this;
};

function factory(files, cwd) {
  return toArray(files).map(function(file) {
    return new File(file, cwd);
  });
}

function src(files, baseDir) {
  return toArray(files).reduce(function(result, file) {
    var globResult = types.isString(file) ?
      glob.sync(file, { cwd: baseDir, realpath: true }) :
      [file];

    return result.concat(globResult);
  }, []);
}

function dest(file, cwd) {
  return types.isString(file) ?
    path.isAbsolute(file) ? file : path.join(cwd, file) :
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
module.exports.factory = factory;
module.exports.src = src;
module.exports.dest = dest;
