const type = require("../type");
const path = require("path");
const camelcaseKeys = require("camelcase-keys");
const subarg = require("subarg");
const deprecated = require("./deprecated")("bit-bundler");
const defaults = require("./defaults");
const deprecatedOptions = require("./deprecated.json");

module.exports = function parseCliOptions(args) {
  const cliOptions = camelcaseKeys(subarg(args || []), { deep: true });
  const options = Object.assign({}, defaults, cliOptions);
  
  try {
    var configFilePath = path.join(process.cwd(), options.config);
    var configFile = require(configFilePath);
    Object.assign(options, camelcaseKeys(configFile, { deep: true }));
  }
  catch(ex) {
    if (typeof options.config === "string") {
      // console.error(ex);
      process.exit(1);
    }
  }
  finally {
    Object.assign(options, cliOptions);
  }

  return type.coerceValues(processDeprecated(options), {
    "config": type.String,
    "src": type.Array.withTransform(configureSrc),
    "dest": type.String,
    "baseUrl": type.String,
    "stubNotFound": type.Boolean,
    "sourceMap": type.Boolean,
    "exportNames": type.Boolean,
    "watch": type.Boolean,
    "loader": type.Array.withTransform(toArray),
    "bundler": type.Array.withTransform(toArray),
    "multiprocess": type.Any.withTransform(toNumberOrBoolean)
  });

  function configureSrc(src) {
    return options._.length ? options._ : toArray(src);
  }
  
  function toArray(value) {
    return value && value._ ? value._ : [].concat(value);
  }
  
  function toNumberOrBoolean(value) {
    if (!value || value === "false") {
      return false;
    }
    else if (value === "true") {
      return true;
    }
    else {
      return Number(value);
    }
  }

  function processDeprecated(options) {
    return deprecated(deprecatedOptions)(options);
  }
};
