#!/usr/bin/env node

/*eslint no-console: ["off"]*/

const path = require("path");
const utils = require("belty");
const options = require("../src/options")(process.argv.slice(2));
const files = utils.pick(options, ["src", "dest", "content", "path"]);

if (options.print) {
  console.log("files: ", JSON.stringify(files));
  console.log("options: ", JSON.stringify(options));
}
else {
  const Bitbundler = require("../src/index");
  const settings = utils.omit(options, ["src", "dest", "content", "path"]);

  if (files.src) {
    Bitbundler.bundle(files, settings);
  }
  else {
    process.stdout.write("> waiting for stream input...\n");
    readFromStdin((content) => {
      Bitbundler.bundle({
        src: [{
          source: content,
          path: path.join(process.cwd(), (files.path || "/$anonymous.js"))
        }],
        dest: files.dest
      }, settings);
    });
  }
}

function readFromStdin(cb) {
  var source = "";

  process.stdin
    .setEncoding("utf8")
    .on("readable", () => {
      var chunk;
      while ((chunk = process.stdin.read())) {
        source += chunk;
      }
    })
    .on("end", () => {
      cb(source);
    });
}
