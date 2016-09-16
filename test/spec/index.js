/*eslint quotes: ["off"]*/

import { expect } from "chai";
import Bundler from "../../src/index";
import jsPlugin from "bit-loader-js";
import splitBundle from "bit-bundler-splitter";

describe("Bundler test suite", function() {
  var act, bundler, config;

  beforeEach(function() {
    act = () => bundler = new Bundler(config);
  });

  describe("When creating a bundler with no configuration", function() {
    beforeEach(function() {
      config = null;
      act();
    });

    it("then the bundler is an instance of Bundler", function() {
      expect(bundler).to.be.an.instanceof(Bundler);
    });

    describe("and bundling a modules with a couple dependencies", function() {
      var result;

      beforeEach(function() {
        return bundler.bundle("test/sample/X.js").then(function(ctx) {
          result = ctx;
        });
      });

      it("then result does not contain the dependencies", function() {
        expect(trimResult(result.bundle.result)).to.be.equal(`require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){/*eslint no-console: ["off"]*/var Y = require("./Y");function X() {  console.log("Say X");  this._y = new Y();}module.exports = new X();},{}]},{},[1])`);
      });
    });
  });

  describe("When creating a bundler with the JS plugin", function() {
    beforeEach(function() {
      config = {
        loader: {
          plugins: jsPlugin()
        }
      };
      act();
    });

    it("then the bundler is an instance of Bundler", function() {
      expect(bundler).to.be.an.instanceof(Bundler);
    });

    describe("and bundling a module with a couple of dependencies", function() {
      var result;

      beforeEach(function() {
        return bundler.bundle("test/sample/X.js").then(function(ctx) {
          result = ctx;
        });
      });

      it("then result contains the dependencies", function() {
        expect(trimResult(result.bundle.result)).to.be.equal(`require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){/*eslint no-console: ["off"]*/var Y = require("./Y");function X() {  console.log("Say X");  this._y = new Y();}module.exports = new X();},{"./Y":2}],2:[function(require,module,exports){/*eslint no-console: ["off"]*/var z = require("./z");function Y() {  console.log("Say Y");  z.potatoes();}module.exports = Y;},{"./z":3}],3:[function(require,module,exports){/*eslint no-console: ["off"]*/module.exports = {  roast: "this",  potatoes: function() {    console.log("Say potatoes");  }};},{}]},{},[1])`);
      });
    });
  });

  describe("When creating a bundler with the JS plugin and spitting bundles", function() {
    beforeEach(function() {
      config = {
        loader: {
          plugins: jsPlugin()
        },
        bundler: {
          plugins: [
            splitBundle("test/dest/Y.js", { match: { fileName: "Y.js" }}),
            splitBundle("test/dest/Z.js", { match: { fileName: "z.js" } })
          ]
        }
      };
      act();
    });

    it("then the bundler is an instance of Bundler", function() {
      expect(bundler).to.be.an.instanceof(Bundler);
    });

    describe("and bundling a module with a couple of dependencies", function() {
      var result;

      beforeEach(function() {
        return bundler.bundle("test/sample/X.js").then(function(ctx) {
          result = ctx;
        });
      });

      it("then the result has one root module", function() {
        expect(result.modules).to.have.lengthOf(1);
      });

      it("then the result root module is X.js", function() {
        expect(result.modules[0].fileName).to.be.equal("X.js");
      });

      it("then result contains the dependencies", function() {
        expect(trimResult(result.bundle.result)).to.be.equal(`require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){/*eslint no-console: ["off"]*/var Y = require("./Y");function X() {  console.log("Say X");  this._y = new Y();}module.exports = new X();},{"./Y":2}]},{},[1])`);
      });

      it("then splitter created a shard for 'test/dest/Y.js'", function() {
        expect(result.shards).to.have.property("test/dest/Y.js");
      });

      it("then splitter created a shard for 'test/dest/Y.js' with the correct bundle result", function() {
        expect(trimResult(result.shards["test/dest/Y.js"].result)).to.be.equal(`require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module \'"+o+"\'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({2:[function(require,module,exports){/*eslint no-console: ["off"]*/var z = require("./z");function Y() {  console.log("Say Y");  z.potatoes();}module.exports = Y;},{"./z":3}],3:[function(require,module,exports){/*eslint no-console: ["off"]*/module.exports = {  roast: "this",  potatoes: function() {    console.log("Say potatoes");  }};},{}]},{},[2])`);
      });

      it("then splitter created a shard for 'test/dest/Z.js'", function() {
        expect(result.shards).to.have.property("test/dest/Z.js");
      });

      it("then splitter created a shard for 'test/dest/Z.js' with the correct bundle result", function() {
        expect(trimResult(result.shards["test/dest/Z.js"].result)).to.be.equal(`require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({3:[function(require,module,exports){/*eslint no-console: ["off"]*/module.exports = {  roast: "this",  potatoes: function() {    console.log("Say potatoes");  }};},{}]},{},[3])`);
      });
    });
  });
});

function trimResult(data) {
  return data
    .toString()
    .replace(/\n/g, "")
    .replace(/\/\/# sourceMappingURL=.*/, "");
}
