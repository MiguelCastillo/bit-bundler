var resolver = require("bit-bundler-utils/resolvePath").configure({baseUrl: __filename});
var path = require("path");


var builtInMap = {
  process: {
    name: "process",
    target: "process/browser",
    test: function(moduleMeta) {
      return /process.(cwd|nextTick|platform)/.test(moduleMeta.source) && moduleMeta.name !== builtInMap.process.name;
    },
    value: function() {
      return "require('process')";
    }
  },
  __dirname: {
    name: "__dirname",
    test: function(moduleMeta) {
      return /\b__dirname\b/.test(moduleMeta.source);
    },
    value: function(moduleMeta) {
      return "'/" + path.relative(".", moduleMeta.directory) + "'";
    }
  },
  __filename: {
    name: "__filename",
    test: function(moduleMeta) {
      return /\b__filename\b/.test(moduleMeta.source);
    },
    value: function(moduleMeta) {
      return "'/" + path.relative(".", moduleMeta.path) + "'";
    }
  }
};


function resolveBuiltin(moduleMeta) {
  if (builtInMap.hasOwnProperty(moduleMeta.name)) {
    return resolver({
      name: builtInMap[moduleMeta.name].target
    });
  }
}


function transformBuiltin(moduleMeta) {
  var wrapped;

  var builtInResult = Object.keys(builtInMap).reduce(function(container, builtIn) {
    if (builtInMap[builtIn].test(moduleMeta)) {
      container.params.push(builtIn);
      container.deps.push(builtInMap[builtIn].value(moduleMeta));
    }

    return container;
  }, {params: [], deps: []});

  if (builtInResult.params.length) {
    wrapped = "(function(" + builtInResult.params.join(",") + ") {\n";
    wrapped += moduleMeta.source;
    wrapped += "\n})(" + builtInResult.deps.join(",") + ")";
  }

  return {
    source: wrapped || moduleMeta.source
  };
}


module.exports = function() {
  return {
    resolve: resolveBuiltin,
    transform: transformBuiltin
  };
};
