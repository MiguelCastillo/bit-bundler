const fs = require("fs");

function fromFilePath(filePath) {
  return fs.readFileSync(filePath).toString();
}

function fromModuleName(moduleName) {
  return fs.readFileSync(require.resolve(moduleName)).toString();
}

module.exports.fromFilePath = fromFilePath;
module.exports.fromModuleName = fromModuleName;
