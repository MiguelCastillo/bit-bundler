"use strict";

class Bundle {
  constructor(name, options, main) {
    Object.defineProperties(this, {
      "isMain": {
        value: !!main,
        writable: false
      }
    });

    options = options || {};
    var dest = options.dest;

    // Try to see if we need to use the bundle as the dest. This
    // helps simplify the syntax for creating bundles.
    if (!dest) {
      dest = dest !== false && looksLikeFileName(name) ? name : false;
    }

    Object.assign(this, { entries: [] }, options, { name: name, dest: dest });
  }

  configure(options) {
    if (!options || options === this) {
      return this;
    }

    return new Bundle(this.name || options.name, Object.assign({}, this, options), this.isMain);
  }

  clear() {
    return this.configure({content: null});
  }

  setDest(dest) {
    return this.configure({dest});
  }

  setName(name) {
    return this.configure({name});
  }

  setContent(content) {
    return this.configure({content});
  }

  setEntries(entries) {
    const updatedEntries = this.entries
      .concat(entries)
      .filter(Boolean)
      .reduce((container, item) => {
        container[item] = true;
        return container;
      }, {});

    return this.configure({entries: Object.keys(updatedEntries)});
  }

  setModules(modules) {
    return this.configure({modules});
  }
}

function looksLikeFileName(name) {
  return /[\w]+[\.][\w]+$/.test(name);
}

module.exports = Bundle;
