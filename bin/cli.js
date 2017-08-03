#!/usr/bin/env node

var Type = require("./type");
var path = require("path");
var argv = require("subarg")(process.argv.slice(2));

var options = camelKeys(argv);

if (options.config) {
  if (options.config === true) {
    options.config = ".bitbundlerrc";
  }

  options.config = path.join(process.cwd(), options.config);
  options = Object.assign({}, camelKeys(require(options.config)), options);
}

var options = Type.coerceValues(options, {
  "config": Type.String,
  "src": Type.Array.withTransform(toArray),
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

function parseFiles(options) {
  return {
    src: options._.concat(toArray(options.src)).filter(Boolean),
    dest: options.dest
  };
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
