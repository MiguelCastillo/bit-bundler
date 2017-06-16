#!/usr/bin/env node

var Type = require("./type");
var argv = require("subarg")(process.argv.slice(2));

var options = Type.coerceValues(argv, {
  "src": Type.Array.withTransform(toArray),
  "dest": Type.String,
  "base-url": Type.String,
  "stub-not-found": Type.Boolean,
  "source-map": Type.Boolean,
  "export-names": Type.Boolean,
  "watch": Type.Boolean,
  "loader": Type.Array.withTransform(toArray),
  "bundler": Type.Array.withTransform(toArray)
});

var files = {
  src: argv.src,
  dest: argv.dest
};


if (argv.print) {
  console.log("files: ", JSON.stringify(files));
  console.log("options: ", JSON.stringify(camelKeys(options)));
}
else {
  require("../src/index").bundle(files, camelKeys(options));
}

function parseFiles(argv) {
  return {
    src: argv._.concat(toArray(argv.src)).filter(Boolean),
    dest: argv.dest
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
