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

    Object.assign(this, options, { name: name, dest: dest });
  }

  configure(options) {
    return !options || options === this ? this : new Bundle(this.name, Object.assign({}, this, options), this.isMain);
  }

  clear() {
    return this.configure({ content: null });
  }

  setDest(dest) {
    this.dest = dest;
    return this;
  }

  setName(name) {
    this.name = name;
    return this;
  }

  setContent(content) {
    this.content = content;
    return this;
  }

  setEntries(entires) {
    this.entries = entires;
    return this;
  }

  setModules(modules) {
    this.modules = modules;
    return this;
  }
}

function looksLikeFileName(name) {
  return /[\w]+[\.][\w]+$/.test(name);
}

module.exports = Bundle;
