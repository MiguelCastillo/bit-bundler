#!/usr/bin/env node

/*eslint no-console: ["off"]*/

const utils = require("belty");
const options = require("../src/options")(process.argv.slice(2));
const files = utils.pick(options, ["src", "dest", "content", "path"]);

if (options.print) {
  console.log("files: ", JSON.stringify(files));
  console.log("options: ", JSON.stringify(options));
}
else {
  require("../src/index").bundle(files, utils.omit(options, ["src", "dest", "content", "path"]));
}
