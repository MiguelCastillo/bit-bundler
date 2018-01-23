module.exports = function (moduleMap, entries) {
  var results = {};

  function get(id) {
    if (!results.hasOwnProperty(id)) {
      var meta = { exports: {} };
      var load = moduleMap[id][0];
      var deps = moduleMap[id][1];
      results[id] = meta.exports;
      load(dependencyGetter(deps), meta, meta.exports);
      results[id] = meta.exports;
    }

    return results[id];
  }

  function has(id) {
    return moduleMap[id];
  }

  function dependencyGetter(depsByName) {
    return function getDependency(name) {
      var id = depsByName[name];

      if (has(id)) {
        return get(id);
      }

      for (var _next = get.next; _next; _next = _next.next) {
        if (_next.has(id)) {
          return _next.get(id);
        }
      }

      for (var _prev = get.prev; _prev; _prev = _prev.prev) {
        if (_prev.has(id)) {
          return _prev.get(id);
        }
      }

      throw new Error("Module '" + name + "' with id " + id + " was not found");
    };
  }

  get.get = get;
  get.has = has;
  get.next = typeof _bb$iter === "undefined" ? null : _bb$iter;

  if (entries.length) {
    for (var _prev = get, _next = get.next; _next;) {
      _next.prev = _prev;
      _prev = _next;
      _next = _next.next;
    }
  }

  entries.forEach(get);
  return get;
};
