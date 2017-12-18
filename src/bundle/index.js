"use strict";

var utils = require("belty");

class Bundle {
  constructor(name, options, main) {
    Object.defineProperties(this, {
      "isMain": {
        value: !!main,
        writable: false
      }
    });

    Object.assign(this, options, { name: name });
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
