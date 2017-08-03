#!/usr/bin/env node

var Type = require("./type");
var path = require("path");
var argv = require("subarg")(process.argv.slice(2));

var options = camelKeys(argv);

try {
  options.config = path.join(process.cwd(), typeof options.config === "string" ? options.config : ".bitbundler");
  options = Object.assign({}, camelKeys(require(options.config)), options);
}
catch(ex) {
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
  "bundler": Type.Array.withTransform(toArray)
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

function camelKeys(args) {
  var result;

  if (args && args.constructor === Object) {
    result = {}
    Object.keys(args).forEach(arg => result[toCamel(arg)] = camelKeys(args[arg]));
  }
  else if (Array.isArray(args)) {
    result = args.map(camelKeys);
  }

  return result || args;
}

function toCamel(name) {
  return name.replace(/\-(\w)/g, (match, value) => value.toUpperCase());
}
