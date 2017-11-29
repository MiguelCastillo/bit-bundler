#!/usr/bin/env node

const options = require("../src/options")(process.argv.slice(2));

var files = {
  src: options.src,
  dest: options.dest
};

if (options.print) {
  console.log("files: ", JSON.stringify(files));
  console.log("options: ", JSON.stringify(options));
}
else {
  require("../src/index").bundle(files, options);
}
