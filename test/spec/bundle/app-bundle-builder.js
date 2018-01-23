import wrapModule from "../..//helpers/wrapModule";
import appBundleBuilder from "../../../src/bundle/app-bundle-builder";
import appBundlePrelude from "../../../src/bundle/app-bundle-prelude";
import combineSourceMap from "combine-source-map";
import { expect } from "chai";

const prelude = appBundlePrelude.toString();

describe("Bundle builder test suite", function() {
  describe("When bundling a hello world module with no entry", function() {
    var input, result;

    beforeEach(function() {
      input = "module.exports = console.log('hello world');";

      result = appBundleBuilder.buildBundle({
        1: { source: input }
      });
    });

    it("then the bundler generates the correct result", function() {
      var expected = (
`_bb$iter=(${prelude})({
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

      result = appBundleBuilder.buildBundle({
        1: { source: input, entry: true }
      });
    });

    it("then the bundler generates the correct result", function() {
      var expected = (
`_bb$iter=(${prelude})({
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

      result = appBundleBuilder.buildBundle({
        1: { source: input, entry: true, deps: [{ id: 2, name: "path" }, { id: 3, name: "process" }] },
        2: { source: dep1 },
        3: { source: dep2 }
      });
    });

    it("then the bundler generates the correct result", function() {
      var expected = (
`_bb$iter=(${prelude})({
${wrapModule(input, 1, {"path": 2, "process": 3})},
${wrapModule(dep1, 2)},
${wrapModule(dep2, 3)}
},[1]);

`);

      expect(combineSourceMap.removeComments(result)).to.equal(expected);
    });
  });
});
