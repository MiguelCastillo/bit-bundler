import wrapModule from "../../helpers/wrapModule";
import chunkedBundleBuilder from "../../../src/bundler/chunkedBundleBuilder";
import combineSourceMap from "combine-source-map";
import { expect } from "chai";

import {BUNDLE_MODULE_LOADER} from "../../../src/bundler/bundleConstants";

describe("Bundle builder test suite", function() {
  describe("When bundling a hello world module with no entry", function() {
    var input, result;

    beforeEach(function() {
      input = "module.exports = console.log('hello world');";

      result = chunkedBundleBuilder.buildBundle({
        1: { source: input }
      });
    });

    it("then the bundler generates the correct result", function() {
      var expected = (
`require=_bb$iter=(${BUNDLE_MODULE_LOADER})({
${wrapModule(input, 1)}
},[]);

`);
      expect(combineSourceMap.removeComments(result)).to.equal(expected);
    });
  });

  describe("When bundling a hello world module with an entry", function() {
    var input, result;

    beforeEach(function() {
      input = "module.exports = console.log('hello world');";

      result = chunkedBundleBuilder.buildBundle({
        1: { source: input, entry: true }
      });
    });

    it("then the bundler generates the correct result", function() {
      var expected = (
`require=_bb$iter=(${BUNDLE_MODULE_LOADER})({
${wrapModule(input, 1)}
},[1]);

`);

      expect(combineSourceMap.removeComments(result)).to.equal(expected);
    });
  });


  describe("When bundling a hello world module with an entry and two dependency", function() {
    var input, dep1, dep2, result;

    beforeEach(function() {
      input = "require('path');require('process');module.exports = console.log('hello world');";
      dep1 = "console.log('the path');";
      dep2 = "console.log('the process');";

      result = chunkedBundleBuilder.buildBundle({
        1: { source: input, entry: true, deps: [{ id: 2, name: "path" }, { id: 3, name: "process" }] },
        2: { source: dep1 },
        3: { source: dep2 }
      });
    });

    it("then the bundler generates the correct result", function() {
      var expected = (
`require=_bb$iter=(${BUNDLE_MODULE_LOADER})({
${wrapModule(input, 1, {"path": 2, "process": 3})},
${wrapModule(dep1, 2)},
${wrapModule(dep2, 3)}
},[1]);

`);

      expect(combineSourceMap.removeComments(result)).to.equal(expected);
    });
  });

  describe("When bundling a hello world module with an ES6 dependency", function() {
    var input, dep1, result;

    beforeEach(function() {
      input = "import './X';\nimport('./X');\nexport default 'hello world';";
      dep1 = "console.log('from X.js');";

      result = chunkedBundleBuilder.buildBundle({
        1: { source: input, entry: true, deps: [{ id: 2, name: "./X" }] },
        2: { source: dep1 }
      });
    });

    it("then the bundler generates the correct result", function() {
      var expected = (
`require=_bb$iter=(${BUNDLE_MODULE_LOADER})({
${wrapModule(input, 1, {"./X": 2})},
${wrapModule(dep1, 2)}
},[1]);

`);

      expect(combineSourceMap.removeComments(result)).to.equal(expected);
    });
  });
  
});
