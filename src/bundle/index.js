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
    Object.assign(this, options, { name: name, dest: options.dest === false ? false : (options.dest || name) });
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

module.exports = Bundle;
