"use strict";

var configurator = require("setopt")();
var utils = require("belty");

class Bundle {
  constructor(name, options, main) {
    this.name = name;

    Object.defineProperties(this, {
      "isMain": {
        value: !!main,
        writable: false
      }
    });

    configurator.configure(this, options);
  }

  configure(options) {
    return !options || options === this ? this : new Bundle(this.name, utils.merge({}, this, options), this.main);
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

  setExports(exports) {
    this.exports = exports;
    return this;
  }

  setModules(modules) {
    this.modules = modules;
    return this;
  }
}

module.exports = Bundle;
