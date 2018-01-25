module.exports = function wrapModule(content, id, deps, path) {
  var formattedDeps = "{" +
  Object.keys(deps || {}).reduce((acc, dep) => {
    acc.push(`"${dep}": ${JSON.stringify(deps[dep])}`);
    return acc;
  }, []).join(", ") +
  "}";

  return (
`/**
 * id: ${id}
 * path: ${path ? path : ""}
 * deps: ${formattedDeps}
 */
${id}:[function(_bb$req, module, exports) {
${content.replace(/\brequire\b\s*\(/g, "_bb$req(")}
},${formattedDeps}]`);
};
