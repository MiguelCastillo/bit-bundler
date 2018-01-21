const acorn = require("acorn");
const walk = require("acorn/dist/walk");
const escodegen = require("escodegen");
const umd = require("umd");
const prelude = require("./app-bundle-prelude").toString();
const requireName = "_bb$req";
const cwd = process.cwd();


//
// TODO: ADD SOURCE MAPS!!!
//

function buildBundle(modules, entries, options) {
  options = options || {};
  entries = entries || getEntries(modules);
  const bundleString = `require=${requireName}=(${prelude})(${buildModuleMap(modules, entries)}, ${buildEntries(entries)});\n`;
  return options.umd ? umd(options.umd, `${bundleString}return ${requireName}(${entries[0]});`) : bundleString;
}

function buildModuleMap(modules, entries) {
  var visited = {}, result = [], currentId, deps, formattedDependencies;
  var ids = entries.length ? entries.slice(0) : Object.keys(modules);

  for (var index = 0; index < ids.length; index++) {
    currentId = ids[index];

    if (visited[currentId] || !modules[currentId]) {
      continue;
    }

    visited[currentId] = true;
    deps = modules[currentId].deps || [];
    ids = ids.concat(deps.map(dep => dep.id || dep.path));
    formattedDependencies = buildDependencies(deps);
    result.push(`${getModuleInfo(modules[currentId], formattedDependencies)}\n${currentId}:[ ${wrapSource(modules[currentId])}, ${formattedDependencies}]`);
  }

  return `{\n${result.join(",\n")}\n}`;
}

function wrapSource(mod) {
  return `function(${requireName}, module, exports) {\n${renameRequire(mod)}\n}`;
}

function renameRequire(mod) {
  const ast = acorn.parse(mod.source);

  walk.simple(ast, {
    CallExpression: (node) => {
      if (node.callee.name === "require") {
        node.callee.name = requireName;
      }
    }
  });

  return escodegen.generate(ast);
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

function getModuleInfo(mod, deps) {
  return (
`/**
 * id: ${mod.id}
 * path: ${mod.path.replace(cwd, "")}
 * deps: ${deps}
 */`
  );
}

module.exports.buildBundle = buildBundle;
