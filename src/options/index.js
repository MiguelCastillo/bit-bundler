const type = require("../type");
const path = require("path");
const subarg = require("subarg");
const deprecated = require("./deprecated")("@bit/bundler");
const defaults = require("./defaults");
const deprecatedOptions = require("./deprecated.json");
const cammelCaseKeys = require("../cammelCaseKeys");

module.exports = function parseCliOptions(args) {
  const cliOptions = cammelCaseKeys(subarg(args || []), { ignore: "notifications" });
  const options = Object.assign({}, defaults, cliOptions);

  if (cliOptions._.length) {
    cliOptions.src = cliOptions.src ? [].concat(cliOptions._, cliOptions.src) : cliOptions._;
    cliOptions._ = [];
  }
  
  try {
    var configFilePath = path.join(process.cwd(), options.config);
    var configFile = require(configFilePath);
    Object.assign(options, cammelCaseKeys(configFile, { ignore: "notifications" }));
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
    "src": type.Array.withTransform(toArray),
    "dest": type.String,
    "baseUrl": type.String,
    "stubNotFound": type.Boolean,
    "sourceMap": type.Boolean,
    "exportNames": type.Boolean,
    "watch": type.Boolean.withTransform(maybeBoolean),
    "loader": type.Array.withTransform(toArray),
    "bundler": type.Array.withTransform(toArray),
    "multiprocess": type.Any.withTransform(toNumberOrBoolean),
    "log": type.Any.withTransform(maybeBoolean)
  });

  function toArray(value) {
    return value && value._ ? value._ : [].concat(value);
  }

  function maybeBoolean(value) {
    if (value === "false") {
      return false;
    }
    else if (value === "true") {
      return true;
    }
    else {
      return value;
    }    
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
