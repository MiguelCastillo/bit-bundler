#!/usr/bin/env node

var argv = require("subarg")(process.argv.slice(2));

if (argv.print) {
  console.log("options: ", JSON.stringify(camelKeys(parseArgs(argv))));
  console.log("files: ", JSON.stringify(parseFiles(argv)));
}
else {
  require("../src/index").bundle(parseFiles(argv), camelKeys(parseArgs(argv)));
}

function parseFiles(argv) {
  return {
    src: argv._.concat(flattenDefault(argv, "src")).filter(Boolean),
    dest: argv.dest
  };
}

function parseArgs(argv) {
  return Object.assign({}, argv, {
    loader: [].concat(flattenDefault(argv, "loader")).filter(Boolean),
    bundler: [].concat(flattenDefault(argv, "bundler")).filter(Boolean)
  });
}

function flattenDefault(source, target) {
  return source[target] && source[target]._ ? source[target]._ : source[target];
}

function camelKeys(args) {
  var result;

  if (args && args.constructor === Object) {
    result = {}
    Object.keys(args).forEach(arg => result[toCamel(arg)] = camelKeys(args[arg]));
  }
  else if (Array.isArray(args)) {
    return args.map(camelKeys);
  }

  return result || args;
}

function toCamel(name) {
  return name.replace(/\-(\w)/g, (match, value) => value.toUpperCase());
}
