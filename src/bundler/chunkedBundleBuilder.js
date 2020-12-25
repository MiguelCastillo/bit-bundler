const dynamicImportWalk = require("acorn-dynamic-import/lib/walk").default;
const dynamicImportPlugin = require("acorn-dynamic-import").default;
const acorn = require("acorn").Parser.extend(dynamicImportPlugin);
const acornWalk = dynamicImportWalk(require("acorn-walk"));
const combineSourceMap = require("combine-source-map");
const umd = require("umd");
const bundleConstants = require("./bundleConstants");

const BUNDLE_MODULE_LOADER = bundleConstants.BUNDLE_MODULE_LOADER;
const REQUIRE_NAME = bundleConstants.REQUIRE_NAME;
const BUNDLE_ITERATOR_NAME = bundleConstants.BUNDLE_ITERATOR_NAME;
const PREAMBLE = `require=${BUNDLE_ITERATOR_NAME}=(${BUNDLE_MODULE_LOADER})`;


function buildBundle(modules, options) {
  options = options || {};

  const sourceMap = combineSourceMap.create();
  const entries = options.entries || getEntries(modules);

  var visited = {};
  var result = [];
  var lineno = lineCount(PREAMBLE) + (options.umd ? 1 : 0);
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
    filepath = currentModule.path ? currentModule.path.replace(options.baseUrl + "/", "") : "";

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

  const bundleString = `${PREAMBLE}({\n${result.join(",\n")}\n},[${entries.join(", ")}]);`;

  return options.umd ?
    umd(options.umd, `${bundleString}\nreturn ${BUNDLE_ITERATOR_NAME}(${entries[0]});\n${sourceMap.comment()}\n`) :
    `${bundleString}\n${sourceMap.comment()}\n`;
}

function wrapSource(source) {
  return `function(${REQUIRE_NAME}, module, exports) {\n${renameRequire(source)}\n}`;
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

  acornWalk.simple(ast, {
    CallExpression: (node) => {
      if (node.callee.name === "require") {
        result.splice(node.callee.start - offset, node.callee.end - node.callee.start, REQUIRE_NAME);
        offset += 6;
      }
    }
  });

  return result.join("");
}

function buildDependenciesString(dependencies) {
  return "{" + dependencies.map(dependency => (`"${dependency.name}": ${dependency.id}`)).join(", ") + "}";
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
