module.exports = function (moduleMap, entries) {
  var results = {};

  function get(id, iter) {
    if (!results.hasOwnProperty(id)) {
      var meta = { exports: {} };
      var load = moduleMap[id][0];
      var deps = moduleMap[id][1];
      results[id] = meta.exports;
      load(dependencyGetter(deps, iter), meta, meta.exports);
      results[id] = meta.exports;
    }

    return results[id];
  }

  function has(id) {
    return moduleMap.hasOwnProperty(id);
  }

  function dependencyGetter(depsByName, iter) {
    return function getDependency(name) {
      var id = depsByName[name];

      // If it's a local dependency to this bundle, then load it right away.
      if (has(id)) {
        return get(id);
      }

      // Otherwise search in other bundles
      for (var _next = iter.next; _next; _next = _next.next) {
        if (_next.has(id)) {
          return _next.get(id, _next);
        }
      }

      for (var _prev = iter.prev; _prev; _prev = _prev.prev) {
        if (_prev.has(id)) {
          return _prev.get(id);
        }
      }

      throw new Error("Module '" + name + "' with id " + id + " was not found");
    };
  }

  var bbiter = {
    get: get,
    has: has,
    next: typeof _bb$iter === "undefined" ? null : _bb$iter
  };

  if (entries.length) {
    var _prev = bbiter;
    var _next = bbiter.next;
    while(_next) {
      _next.prev = _prev;
      _prev = _next;
      _next = _next.next;
    }
  }

  entries.forEach(function(id) { get(id, bbiter); });
  return bbiter;
};
