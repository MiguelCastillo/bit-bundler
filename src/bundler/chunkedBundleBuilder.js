const cwd = process.cwd();
const acorn = require("acorn-dynamic-import/lib/inject").default(require("acorn"));
const walk = require("acorn/dist/walk");
const combineSourceMap = require("combine-source-map");
const umd = require("umd");
const prelude = require("./chunkedBundlePrelude").toString();
const requireName = "_bb$req";
const iteratorName = "_bb$iter";
const preamble = `require=${iteratorName}=(${prelude})`;

// Fill this in to prevent the walker from throwing when processing the 'Import' node,
// which is the node generated for dynamic imports.
walk.base["Import"] = function () { };


function buildBundle(modules, options) {
  options = options || {};

  const sourceMap = combineSourceMap.create();
  const entries = getEntries(modules);

  var visited = {};
  var result = [];
  var lineno = lineCount(preamble) + (options.umd ? 1 : 0);
  var ids = entries.length ? entries.slice(0) : Object.keys(modules);
  var filepath, id, currentModule, dependencies, formattedDependencies, formattedPreBundle, formattedPostBundle;

  for (var index = 0; index < ids.length; index++) {
    id = ids[index];

    if (visited[id] || !modules[id]) {
      continue;
    }

    visited[id] = true;
    currentModule = modules[id];
    dependencies = currentModule.deps || [];
    ids = ids.concat(dependencies.map(dep => dep.id));
    filepath = currentModule.path ? currentModule.path.replace(cwd, "") : "";

    formattedDependencies = buildDependenciesString(dependencies);
    formattedPreBundle = `${buildModuleInfoCommentString(id, filepath, formattedDependencies)}\n${id}:`;
    lineno += lineCount(formattedPreBundle);

    sourceMap.addFile({
      source: currentModule.source,
      sourceFile: filepath || "_anonymous.js"
    }, {
        line: lineno
      });

    formattedPostBundle = `[${wrapSource(combineSourceMap.removeComments(currentModule.source))},${formattedDependencies}]`;
    lineno += lineCount(formattedPostBundle) - 1;
    result.push(formattedPreBundle + formattedPostBundle);
  }

  const bundleString = `${preamble}({\n${result.join(",\n")}\n},${buildEntries(entries)});`;

  return options.umd ?
    umd(options.umd, `${bundleString}\nreturn ${iteratorName}(${entries[0]});\n${sourceMap.comment()}\n`) :
    `${bundleString}\n${sourceMap.comment()}\n`;
}

function wrapSource(source) {
  return `function(${requireName}, module, exports) {\n${renameRequire(source)}\n}`;
}

function renameRequire(source) {
  if (!source.match(/\brequire\b\s*\(/)) {
    return source;
  }

  const result = source.split("");
  const ast = acorn.parse(source, {
    sourceType: "module",
    plugins: { dynamicImport: true }
  });

  var offset = 0;

  walk.simple(ast, {
    CallExpression: (node) => {
      if (node.callee.name === "require") {
        result.splice(node.callee.start - offset, node.callee.end - node.callee.start, requireName);
        offset += 6;
      }
    }
  });

  return result.join("");
}

function buildDependenciesString(dependencies) {
  return "{" + dependencies.map(dependency => (`"${dependency.name}": ${dependency.id}`)).join(", ") + "}";
}

function buildEntries(entries) {
  return `[${entries.join(", ")}]`;
}

function getEntries(modules) {
  return Object
    .keys(modules)
    .filter(key => modules[key].entry)
    .map(key => key);
}

function buildModuleInfoCommentString(id, filepath, deps) {
  return (
    `/**
 * id: ${id}
 * path: ${filepath}
 * deps: ${deps}
 */`
  );
}

function lineCount(str) {
  if (!str) {
    return 0;
  }

  const result = str.match(/\n/g);
  return result ? result.length + 1 : 1;
}

module.exports.buildBundle = buildBundle;
