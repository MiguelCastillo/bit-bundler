/*eslint quotes: ["off"]*/

import { expect } from "chai";
import sinon from "sinon";
import jsPlugin from "bit-loader-js";
import splitBundle from "bit-bundler-splitter";
import BitBundler from "../../src/index";
import loggers from "../../loggers";

describe("BitBundler test suite", function() {
  var createBundler, bitbundler;

  beforeEach(function() {
    createBundler = (config) => bitbundler = new BitBundler(Object.assign({ log: { stream: loggers.through() } }, config || {}));
  });

  describe("When creating a bundler with no configuration", function() {
    beforeEach(function() {
      createBundler();
    });

    it("then the bundler is an instance of Bundler", function() {
      expect(bitbundler).to.be.an.instanceof(BitBundler);
    });

    describe("and bundling a modules with a couple dependencies", function() {
      var result;

      beforeEach(function() {
        return bitbundler.bundle("test/sample/X.js").then(function(ctx) {
          result = ctx;
        });
      });

      it("then result does not contain the dependencies", function() {
        expect(trimResult(result.bundle.content)).to.be.equal(`require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){/*eslint no-console: ["off"]*/var Y = require("./Y");function X() {  console.log("Say X");  this._y = new Y();}module.exports = new X();},{}]},{},[1])`);
      });
    });
  });

  describe("When creating a bundler with the JS plugin", function() {
    beforeEach(function() {
      createBundler({
        loader: {
          plugins: jsPlugin()
        }
      });
    });

    it("then the bundler is an instance of Bundler", function() {
      expect(bitbundler).to.be.an.instanceof(BitBundler);
    });

    describe("and bundling a module with a couple of dependencies", function() {
      var result;

      beforeEach(function() {
        return bitbundler.bundle("test/sample/X.js").then(function(ctx) {
          result = ctx;
        });
      });

      it("then result contains the dependencies", function() {
        expect(trimResult(result.bundle.content)).to.be.equal(`require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){/*eslint no-console: ["off"]*/var Y = require("./Y");function X() {  console.log("Say X");  this._y = new Y();}module.exports = new X();},{"./Y":2}],2:[function(require,module,exports){/*eslint no-console: ["off"]*/var z = require("./z");var X = require("./X");function Y() {  console.log(X, typeof X);  console.log("Say Y");  z.potatoes();}module.exports = Y;},{"./X":1,"./z":3}],3:[function(require,module,exports){/*eslint no-console: ["off"]*/module.exports = {  roast: "this",  potatoes: function() {    console.log("Say potatoes");  }};},{}]},{},[1])`);
      });
    });
  });

  describe("When creating a bundler with the JS plugin and spitting bundles", function() {
    beforeEach(function() {
      createBundler({
        loader: {
          plugins: jsPlugin()
        },
        bundler: {
          plugins: [
            splitBundle("test/dest/Y.js", { match: { fileName: "Y.js" }}),
            splitBundle("test/dest/Z.js", { match: { fileName: "z.js" } })
          ]
        }
      });
    });

    it("then the bundler is an instance of Bundler", function() {
      expect(bitbundler).to.be.an.instanceof(BitBundler);
    });

    describe("and bundling a module with a couple of dependencies", function() {
      var result;

      beforeEach(function() {
        return bitbundler.bundle("test/sample/X.js").then(function(ctx) {
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
        expect(trimResult(result.bundle.content)).to.be.equal(`require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){/*eslint no-console: ["off"]*/var Y = require("./Y");function X() {  console.log("Say X");  this._y = new Y();}module.exports = new X();},{"./Y":2}]},{},[1])`);
      });

      it("then splitter created a shard for 'test/dest/Y.js'", function() {
        expect(result.shards).to.have.property("test/dest/Y.js");
      });

      it("then splitter created a shard for 'test/dest/Y.js' with the correct bundle result", function() {
        expect(trimResult(result.shards["test/dest/Y.js"].content)).to.be.equal(`require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({2:[function(require,module,exports){/*eslint no-console: ["off"]*/var z = require("./z");var X = require("./X");function Y() {  console.log(X, typeof X);  console.log("Say Y");  z.potatoes();}module.exports = Y;},{"./X":1,"./z":3}],3:[function(require,module,exports){/*eslint no-console: ["off"]*/module.exports = {  roast: "this",  potatoes: function() {    console.log("Say potatoes");  }};},{}],1:[function(require,module,exports){/*eslint no-console: ["off"]*/var Y = require("./Y");function X() {  console.log("Say X");  this._y = new Y();}module.exports = new X();},{"./Y":2}]},{},[2])`);
      });

      it("then splitter created a shard for 'test/dest/Z.js'", function() {
        expect(result.shards).to.have.property("test/dest/Z.js");
      });

      it("then splitter created a shard for 'test/dest/Z.js' with the correct bundle result", function() {
        expect(trimResult(result.shards["test/dest/Z.js"].content)).to.be.equal(`require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({3:[function(require,module,exports){/*eslint no-console: ["off"]*/module.exports = {  roast: "this",  potatoes: function() {    console.log("Say potatoes");  }};},{}]},{},[3])`);
      });
    });
  });

  describe("Given a bundler", function() {
    var context, buildInit, buildStart, buildEnd;

    beforeEach(function() {
      createBundler();
      sinon.spy(bitbundler, "emit");
      context = createMockContext();
      bitbundler._createContext = sinon.stub().returns(context);
      bitbundler._writeContext = sinon.stub().returns(context);

      buildInit = sinon.stub();
      buildStart = sinon.stub();
      buildEnd = sinon.stub();

      bitbundler
        .on("build-init", buildInit)
        .on("build-start", buildStart)
        .on("build-end", buildEnd);
    });

    describe("And creating a bundle with one files", function() {
      beforeEach(function() {
        return bitbundler.bundle(["test/sample/X.js"]);
      });

      it("then emit is called with `build-init`", function() {
        sinon.assert.calledWith(bitbundler.emit, "build-init");
      });

      it("then emit is called with `build-start`", function() {
        sinon.assert.calledWith(bitbundler.emit, "build-start");
      });

      it("then initBuild event handler is called", function() {
        sinon.assert.called(buildInit);
      });

      it("then preBuild event handler is called", function() {
        sinon.assert.called(buildStart);
      });

      it("then postBuild event handler is called", function() {
        sinon.assert.called(buildEnd);
      });

      it("then context is executed with the given file names", function() {
        sinon.assert.calledWith(context.execute, sinon.match(arrayItemContains("test/sample/X.js")));
      });

      it("then visitBundles is called", function() {
        sinon.assert.called(context.visitBundles);
      });
    });

    describe("And updating a bundle with one files", function() {
      var file;

      beforeEach(function() {
        file = new BitBundler.File("test/sample/X.js");

        file.src.forEach(function(filePath) {
          context.cache[filePath] = true;
        });

        bitbundler.context = context;
        return bitbundler.update(file.src);
      });

      it("then emit is called with `build-init`", function() {
        sinon.assert.neverCalledWith(bitbundler.emit, "build-init");
      });

      it("then emit is called with `build-start`", function() {
        sinon.assert.calledWith(bitbundler.emit, "build-start");
      });

      it("then context loader delete module is called", function() {
        sinon.assert.called(context.loader.deleteModule);
      });

      it("then initBuild event handler is NOT called", function() {
        sinon.assert.notCalled(buildInit);
      });

      it("then preBuild event handler is called", function() {
        sinon.assert.called(buildStart);
      });

      it("then postBuild event handler is called", function() {
        sinon.assert.called(buildEnd);
      });

      it("then context is executed with the given file names", function() {
        sinon.assert.calledWith(context.execute, sinon.match(arrayItemContains("test/sample/X.js")));
      });
    });

    describe("And bundling fails", function() {
      beforeEach(function() {
        context.execute = sinon.stub().rejects("bad");
        return bitbundler.bundle(["test/sample/X.js"]).catch(function() {});
      });

      it("then emit is called with `build-init`", function() {
        sinon.assert.calledWith(bitbundler.emit, "build-init");
      });

      it("then emit is called with `build-start`", function() {
        sinon.assert.calledWith(bitbundler.emit, "build-start");
      });

      it("then initBuild event handler is called", function() {
        sinon.assert.called(buildInit);
      });

      it("then preBuild event handler is called", function() {
        sinon.assert.called(buildStart);
      });

      it("then postBuild event handler is called", function() {
        sinon.assert.called(buildEnd);
      });
    });
  });

  describe("Given a bundler with a single function notifications configured", function() {
    var notificationStub, initBuildStub, context;

    beforeEach(function() {
      initBuildStub = sinon.stub();
      notificationStub = sinon.stub().returns({ "build-init": initBuildStub });
      createBundler({ notifications: notificationStub });

      sinon.spy(bitbundler, "emit");
      context = createMockContext();
      bitbundler._createContext = sinon.stub().returns(context);
      bitbundler._writeContext = sinon.stub().returns(context);

      return bitbundler.bundle(["test/sample/X.js"]);
    });

    it("then the notification function is called", function() {
      sinon.assert.called(notificationStub);
    });

    it("then the registered build-init callback is called", function() {
      sinon.assert.called(initBuildStub);
    });
  });

  describe("Given a bundler with multiple function notifications configured", function() {
    var notificationStub1, notificationStub2, buildInitStub1, buildInitStub2, context;

    beforeEach(function() {
      buildInitStub1 = sinon.stub();
      buildInitStub2 = sinon.stub();
      notificationStub1 = sinon.stub().returns({ "build-init": buildInitStub1 });
      notificationStub2 = sinon.stub().returns({ "build-init": buildInitStub2 });
      createBundler({ notifications: [notificationStub1, notificationStub2] });

      sinon.spy(bitbundler, "emit");
      context = createMockContext();
      bitbundler._createContext = sinon.stub().returns(context);
      bitbundler._writeContext = sinon.stub().returns(context);

      return bitbundler.bundle(["test/sample/X.js"]);
    });

    it("then the first notification function is called", function() {
      sinon.assert.called(notificationStub1);
    });

    it("then the second notification function is called", function() {
      sinon.assert.called(notificationStub2);
    });

    it("then the first registered build-init callback is called", function() {
      sinon.assert.called(buildInitStub1);
    });

    it("then the second registered build-init callback is called", function() {
      sinon.assert.called(buildInitStub2);
    });
  });

  describe("Given a bundler with a single notification configured", function() {
    var context, initBuildStub;

    beforeEach(function() {
      initBuildStub = sinon.stub();

      createBundler({
        notifications: {
          "build-init": initBuildStub
        }
      });

      sinon.spy(bitbundler, "emit");
      context = createMockContext();
      bitbundler._createContext = sinon.stub().returns(context);
      bitbundler._writeContext = sinon.stub().returns(context);

      return bitbundler.bundle(["test/sample/X.js"]);
    });

    it("then build-init callback is called", function() {
      sinon.assert.called(initBuildStub);
    });
  });
});

function createMockContext() {
  var context = {
    execute: sinon.stub().resolves(context),
    cache: {},
    loader: {
      deleteModule: sinon.stub(),
    },
    visitBundles: sinon.stub().returns(context)
  };

  return context;
}

function trimResult(data) {
  return data
    .toString()
    .replace(/\n/g, "")
    .replace(/\/\/# sourceMappingURL=.*/, "");
}


function arrayItemContains(value) {
  return function(array) {
    return array.find(function(str) {
      return str.indexOf(value) !== -1;
    });
  };
}
