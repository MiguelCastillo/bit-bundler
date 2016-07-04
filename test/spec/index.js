/*eslint quotes: ["off"]*/

import { expect } from "chai";
import Bundler from "../../src/index";
import jsPlugin from "bit-loader-js";

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
          result = ctx.bundle.result.replace(/\n/g, "");
        });
      });

      it("then result does not contain the dependencies", function() {
        expect(result).to.be.equal(`require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){/*eslint no-console: ["off"]*/var Y = require("./Y");function X() {  console.log("Say X");  this._y = new Y();}module.exports = new X();},{}]},{},[1])//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9iaXQtYnVuZGxlci1icm93c2VycGFjay9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwidGVzdC9zYW1wbGUvWC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8qZXNsaW50IG5vLWNvbnNvbGU6IFtcIm9mZlwiXSovXG52YXIgWSA9IHJlcXVpcmUoXCIuL1lcIik7XG5cbmZ1bmN0aW9uIFgoKSB7XG4gIGNvbnNvbGUubG9nKFwiU2F5IFhcIik7XG4gIHRoaXMuX3kgPSBuZXcgWSgpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IG5ldyBYKCk7XG4iXX0=`);
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
          result = ctx.bundle.result.replace(/\n/g, "");
        });
      });

      it("then result contains the dependencies", function() {
        expect(result).to.be.equal(`require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){/*eslint no-console: ["off"]*/var Y = require("./Y");function X() {  console.log("Say X");  this._y = new Y();}module.exports = new X();},{"./Y":2}],2:[function(require,module,exports){/*eslint no-console: ["off"]*/var z = require("./z");function Y() {  console.log("Say Y");  z.potatoes();}module.exports = Y;},{"./z":3}],3:[function(require,module,exports){/*eslint no-console: ["off"]*/module.exports = {  roast: "this",  potatoes: function() {    console.log("Say potatoes");  }};},{}]},{},[1])//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9iaXQtYnVuZGxlci1icm93c2VycGFjay9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwidGVzdC9zYW1wbGUvWC5qcyIsInRlc3Qvc2FtcGxlL1kuanMiLCJ0ZXN0L3NhbXBsZS96LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDVEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDVEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvKmVzbGludCBuby1jb25zb2xlOiBbXCJvZmZcIl0qL1xudmFyIFkgPSByZXF1aXJlKFwiLi9ZXCIpO1xuXG5mdW5jdGlvbiBYKCkge1xuICBjb25zb2xlLmxvZyhcIlNheSBYXCIpO1xuICB0aGlzLl95ID0gbmV3IFkoKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBuZXcgWCgpO1xuIiwiLyplc2xpbnQgbm8tY29uc29sZTogW1wib2ZmXCJdKi9cbnZhciB6ID0gcmVxdWlyZShcIi4velwiKTtcblxuZnVuY3Rpb24gWSgpIHtcbiAgY29uc29sZS5sb2coXCJTYXkgWVwiKTtcbiAgei5wb3RhdG9lcygpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFk7XG4iLCIvKmVzbGludCBuby1jb25zb2xlOiBbXCJvZmZcIl0qL1xubW9kdWxlLmV4cG9ydHMgPSB7XG4gIHJvYXN0OiBcInRoaXNcIixcbiAgcG90YXRvZXM6IGZ1bmN0aW9uKCkge1xuICAgIGNvbnNvbGUubG9nKFwiU2F5IHBvdGF0b2VzXCIpO1xuICB9XG59O1xuIl19`);
      });
    });
  });
});
