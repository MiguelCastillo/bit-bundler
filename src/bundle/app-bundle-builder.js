const cwd = process.cwd();
const acorn = require("acorn");
const walk = require("acorn/dist/walk");
const combineSourceMap = require("combine-source-map");
const umd = require("umd");
const prelude = require("./app-bundle-prelude").toString();
const requireName = "_bb$req";
const iteratorName = "_bb$iter";
const preamble =`require=${iteratorName}=(${prelude})`;

function buildBundle(modules, options) {
  options = options || {};

  const sourceMap = combineSourceMap.create();
  const entries = options.entries || getEntries(modules);

  var visited = {};
  var result = [];
  var lineno = lineCount(preamble) + (options.umd ? 1 : 0);
  var ids = entries.length ? entries.slice(0) : Object.keys(modules);
  var id, currentModule, dependencies, formattedDependencies, formattedPreBundle, formattedPostBundle;

  for (var index = 0; index < ids.length; index++) {
    id = ids[index];

    if (visited[id] || !modules[id]) {
      continue;
    }

    visited[id] = true;
    currentModule = modules[id];
    dependencies = currentModule.deps || [];
    ids = ids.concat(dependencies.map(dep => dep.id || dep.path));

    formattedDependencies = buildDependencies(dependencies);
    formattedPreBundle = `${buildModuleInfoComment(currentModule, id, formattedDependencies)}\n${id}:`;
    lineno += lineCount(formattedPreBundle);

    sourceMap.addFile({
      source: currentModule.source,
      sourceFile: currentModule.path ? currentModule.path.replace(cwd, "") : "_anonymous.js"
    }, {
      line: lineno
    });

    formattedPostBundle = `[${wrapSource(combineSourceMap.removeComments(currentModule.source))},${formattedDependencies}]`;
    lineno += lineCount(formattedPostBundle) - 1;
    result.push(formattedPreBundle + formattedPostBundle);
  }

  const bundleString = `${preamble}({\n${result.join(",\n")}\n},${buildEntries(entries)});`;
  return options.umd ? umd(options.umd, `${bundleString}\nreturn ${iteratorName}(${entries[0]});\n${sourceMap.comment()}\n`) : `${bundleString}\n${sourceMap.comment()}\n`;
}

function wrapSource(source) {
  return `function(${requireName}, module, exports) {\n${renameRequire(source)}\n}`;
}

function renameRequire(source) {
  const result = source.split("");
  const ast = acorn.parse(source);
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

function buildDependencies(dependencies) {
  return "{" + dependencies.map(dependency => (`"${dependency.name}": ${dependency.id ? dependency.id : addQuotes(dependency.path)}`)).join(", ") + "}";
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

function addQuotes(item) {
  return `"${item}"`;
}

function buildModuleInfoComment(mod, id, deps) {
  return (
`/**
 * id: ${id}
 * path: ${mod.path ? mod.path.replace(cwd, "") : ""}
 * deps: ${deps}
 */`
  );
}

function lineCount(str) {
  if (!str || !str.length) {
    return 0;
  }

  const result = str.match(/\n/g);
  return result ? result.length + 1: 1;
}

module.exports.buildBundle = buildBundle;
