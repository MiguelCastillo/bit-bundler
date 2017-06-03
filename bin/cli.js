#!/usr/bin/env node

var argv = require("subarg")(process.argv.slice(2));

if (argv.print) {
  console.log("options: ", JSON.stringify(parseArgs(argv)));
  console.log("files: ", JSON.stringify(parseFiles(argv)));
}
else {
  require("../src/index").bundle(parseFiles(argv), parseArgs(argv));
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
