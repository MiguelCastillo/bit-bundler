var resolver = require("./resolvePath").configure({baseUrl: __filename});


var builtInMap = {
  process: {
    name: "process",
    target: "process/browser"
  }
}


function resolve(moduleMeta) {
  if (builtInMap.hasOwnProperty(moduleMeta.name)) {
    return resolver({
      name: builtInMap[moduleMeta.name].target
    });
  }
}


function transform(moduleMeta) {
  var args = {};
  var wrapped;

  if (/process\.(cwd|nextTick)/g.test(moduleMeta.source) && moduleMeta.name !== builtInMap.process.name) {
    args.process = builtInMap.process;
  }

  var params   = Object.keys(args);
  var requires = Object.keys(args).map(function(r) { return "require('" + args[r].name + "')"; });

  if (params.length) {
    wrapped = "(function(" + params.join(",") + ") {\n";
    wrapped += moduleMeta.source;
    wrapped += "\n})(" + requires.join(",") + ")";
  }

  return {
    source: wrapped || moduleMeta.source
  };
}


module.exports = {
  resolve: resolve,
  transform: transform
};
