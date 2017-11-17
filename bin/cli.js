#!/usr/bin/env node

const Type = require("./type");
const path = require("path");
const camelcaseKeys = require("camelcase-keys");
const argv = require("subarg")(process.argv.slice(2));

var options = camelcaseKeys(argv, { deep: true });

try {
  var configFile = path.join(process.cwd(), typeof options.config === "string" ? options.config : ".bitbundler");
  options = Object.assign({}, camelcaseKeys(require(configFile), { deep: true }), options, { config: configFile });
}
catch(ex) {
  if (typeof options.config === "string") {
    console.error(ex);
    process.exit(1);
  }
}

options = Type.coerceValues(options, {
  "config": Type.String,
  "src": Type.Array.withTransform(configureSrc),
  "dest": Type.String,
  "baseUrl": Type.String,
  "stubNotFound": Type.Boolean,
  "sourceMap": Type.Boolean,
  "exportNames": Type.Boolean,
  "watch": Type.Boolean,
  "loader": Type.Array.withTransform(toArray),
  "bundler": Type.Array.withTransform(toArray),
  "multiprocess": Type.Any.withTransform(toNumberOrBoolean)
});

var files = {
  src: options.src,
  dest: options.dest
};

if (argv.print) {
  console.log("files: ", JSON.stringify(files));
  console.log("options: ", JSON.stringify(options));
}
else {
  require("../src/index").bundle(files, options);
}

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
