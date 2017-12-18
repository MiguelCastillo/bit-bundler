module.exports = function flattenModules(cache, modules, exclude) {
  var i = 0;
  var stack = modules.slice(0);
  var id, mod, result = {};
  
  while (stack.length !== i) {
    if (!stack[i].id) {
      continue;
    }

    id = stack[i++].id;

    if (!id || result.hasOwnProperty(id) || (exclude && exclude.indexOf(id) !== -1)) {
      continue;
    }

    mod = cache[id];
    stack = stack.concat(mod.deps);
    result[mod.id] = mod;
  }

  return result;
};
