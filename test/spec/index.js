/*eslint quotes: ["off"]*/

import { expect } from "chai";
import sinon from "sinon";
import path from "path";
import combineSourceMap from "combine-source-map";
import BitBundler from "../../src/index";
import wrapModule from "../helpers/wrapModule";
import readModule from "../helpers/readModule";

import {BUNDLE_MODULE_LOADER} from "../../src/bundler/bundleConstants";

describe("BitBundler test suite", function () {
  var createBundler, bitbundler;

  beforeEach(function () {
    createBundler = (config) => bitbundler = new BitBundler(Object.assign({ log: false }, config || {}));
  });

  describe("bundle output tests", () => {
    describe("bundling a module with a couple of dependencies and no bundle destination", function () {
      var result;
      const entry = readModule.fromFilePath("test/sample/X.js");
      const dep2 = readModule.fromFilePath("test/sample/Y.js");
      const dep3 = readModule.fromFilePath("test/sample/z.js");
      const spromiseContent = trimResult(readModule.fromModuleName("spromise/dist/spromise.min"));

      beforeEach(function () {
        createBundler();

        return bitbundler.bundle("test/sample/X.js").then(function (ctx) {
          result = ctx;
        });
      });

      it("then result in the main bundle contains correct content", function () {
        var expected = [
          `require=_bb$iter=(${BUNDLE_MODULE_LOADER})({`,
          `${wrapModule(entry, 1, { "./Y": 2 }, "test/sample/X.js")},`,
          `${wrapModule(dep2, 2, { "./z": 3, "./X": 1 }, "test/sample/Y.js")},`,
          `${wrapModule(dep3, 3, { "spromise/dist/spromise.min": 4 }, "test/sample/z.js")},`,
          `${wrapModule(spromiseContent, 4, {}, "node_modules/spromise/dist/spromise.min.js")}`,
          "},[1]);",
          "",
          ""
        ].join("\n");

        expect(combineSourceMap.removeComments(result.getBundles("main").content.toString())).to.be.equal(expected);
      });

      it("then the main bundle has the dest set to false", function () {
        expect(result.getBundles("main").dest).to.be.false;
      });
    });

    describe("bundling a module with a couple of dependencies with a bundle destination", function () {
      var result;
      const entry = readModule.fromFilePath("test/sample/X.js");
      const dep2 = readModule.fromFilePath("test/sample/Y.js");
      const dep3 = readModule.fromFilePath("test/sample/z.js");
      const spromiseContent = trimResult(readModule.fromModuleName("spromise/dist/spromise.min"));

      beforeEach(function () {
        createBundler();

        return bitbundler.bundle({ src: "test/sample/X.js", dest: "test/dist/dest-test-bundle.js" }).then(function (ctx) {
          result = ctx;
        });
      });

      it("then result contains correct bundle content", function () {
        var expected = [
          `require=_bb$iter=(${BUNDLE_MODULE_LOADER})({`,
          `${wrapModule(entry, 1, { "./Y": 2 }, "test/sample/X.js")},`,
          `${wrapModule(dep2, 2, { "./z": 3, "./X": 1 }, "test/sample/Y.js")},`,
          `${wrapModule(dep3, 3, { "spromise/dist/spromise.min": 4 }, "test/sample/z.js")},`,
          `${wrapModule(spromiseContent, 4, {}, "node_modules/spromise/dist/spromise.min.js")}`,
          "},[1]);",
          "",
          ""
        ].join("\n");

        expect(combineSourceMap.removeComments(result.getBundles("main").content.toString())).to.be.equal(expected);
      });

      it("then the main bundle has the dest set to correct full path", function () {
        expect(result.getBundles("main").dest).to.be.equal(path.join(process.cwd(), "test/dist/dest-test-bundle.js"));
      });
    });

    describe("with baseUrl different than process.cwd()", function () {
      var result;
      const entry = readModule.fromFilePath("test/sample/X.js");
      const dep2 = readModule.fromFilePath("test/sample/Y.js");
      const dep3 = readModule.fromFilePath("test/sample/z.js");
      const spromiseContent = trimResult(readModule.fromModuleName("spromise/dist/spromise.min"));

      beforeEach(function () {
        const baseUrl = path.resolve(__dirname, "../");
        createBundler({baseUrl: baseUrl});

        return bitbundler.bundle({ src: "sample/X.js", dest: "dist/dest-test-bundle.js" }).then(function (ctx) {
          result = ctx;
        });
      });

      it("then result contains correct bundle content", function () {
        const spromiseFullpath = path.resolve(__dirname, "../../", "node_modules/spromise/dist/spromise.min.js");

        var expected = [
          `require=_bb$iter=(${BUNDLE_MODULE_LOADER})({`,
          `${wrapModule(entry, 1, { "./Y": 2 }, "sample/X.js")},`,
          `${wrapModule(dep2, 2, { "./z": 3, "./X": 1 }, "sample/Y.js")},`,
          `${wrapModule(dep3, 3, { "spromise/dist/spromise.min": 4 }, "sample/z.js")},`,
          `${wrapModule(spromiseContent, 4, {}, spromiseFullpath)}`,
          "},[1]);",
          "",
          ""
        ].join("\n");

        expect(combineSourceMap.removeComments(result.getBundles("main").content.toString())).to.be.equal(expected);
      });

      it("then the main bundle has the dest set to correct full path", function () {
        expect(result.getBundles("main").dest).to.be.equal(path.join(process.cwd(), "test/dist/dest-test-bundle.js"));
      });
    });
  });

  describe("content bundling tests", () => {
    describe("a node built in module", function () {
      var result, error;

      beforeEach(function () {
        createBundler();

        return (
          bitbundler
            .bundle({ content: "require('fs');" })
            .then((ctx) => result = ctx)
            .catch((err) => error = err)
        );
      });

      it("then the result is never set", function () {
        expect(result).to.not.be.ok;
      });

      it("then the error thrown is of type Error", function () {
        expect(error).to.be.instanceof(Error);
      });

      it("then a not found exception is thrown", function () {
        expect(error.message).to.be.equal("ENOENT: no such file or directory, open 'fs'");
      });
    });

    describe("dependency that does not exist", function () {
      var result, error;

      beforeEach(function () {
        createBundler();

        return (
          bitbundler
            .bundle([{ content: "require('./does-not-exist');" }])
            .then((ctx) => result = ctx)
            .catch((err) => error = err)
        );
      });

      it("then the result is never set", function () {
        expect(result).to.not.be.ok;
      });

      it("then the error thrown is of type Error", function () {
        expect(error).to.be.instanceof(Error);
      });

      it("then a not found exception is thrown", function () {
        expect(error.message).to.be.equal(`Cannot find module './does-not-exist' from '${process.cwd()}'`);
      });
    });

    describe("no dependencies", function () {
      const bundleContent = "console.log('hello world');";
      var result;

      beforeEach(function () {
        createBundler();
        return bitbundler.bundle({ src: { content: bundleContent } }).then(ctx => result = ctx);
      });

      it("then the bundle contains the expected content", function () {
        expect(result.shards["main"].content.toString()).to.include("console.log('hello world');");
      });
    });

    describe("with 1 relative dependency", function () {
      const bundleContent = "require('../sample/z');console.log('hello world');";
      const bundleContentPath = path.join(__dirname, "../sample/");
      var result;

      beforeEach(function () {
        createBundler();
        return bitbundler.bundle({ src: { content: bundleContent, path: bundleContentPath } }).then(ctx => result = ctx);
      });

      it("then the bundle contains the expected content", function () {
        expect(result.shards["main"].content.toString()).to.include(`roast: "this",\n  potatoes`);
      });
    });
  });

  describe("exportNames tests", () => {
    describe("bundling with exportNames 'true'", function () {
      var result;
      const entry = readModule.fromFilePath("test/sample/X.js");
      const dep2 = readModule.fromFilePath("test/sample/Y.js");
      const dep3 = readModule.fromFilePath("test/sample/z.js");
      const spromiseContent = trimResult(readModule.fromModuleName("spromise/dist/spromise.min"));

      beforeEach(function () {
        createBundler({ exportNames: true });
        return bitbundler.bundle({ src: "test/sample/X.js" }).then(function (ctx) {
          result = ctx;
        });
      });

      it("then result in the main bundle contains correct content", function () {
        var expected = [
          `require=_bb$iter=(${BUNDLE_MODULE_LOADER})({`,
          `${wrapModule(entry, 1, { "./Y": 2 }, "test/sample/X.js")},`,
          `${wrapModule(dep2, 2, { "./z": 3, "./X": 1 }, "test/sample/Y.js")},`,
          `${wrapModule(dep3, 3, { "spromise/dist/spromise.min": "spromise/dist/spromise.min" }, "test/sample/z.js")},`,
          `${wrapModule(spromiseContent, '"spromise/dist/spromise.min"', {}, "node_modules/spromise/dist/spromise.min.js")}`,
          "},[1]);",
          "",
          ""
        ].join("\n");

        expect(combineSourceMap.removeComments(result.getBundles("main").content.toString())).to.be.equal(expected);
      });
    });

    describe("bundling with exportNames array of module names", function () {
      var result;
      const entry = readModule.fromFilePath("test/sample/X.js");
      const dep2 = readModule.fromFilePath("test/sample/Y.js");
      const dep3 = readModule.fromFilePath("test/sample/z.js");
      const spromiseContent = trimResult(readModule.fromModuleName("spromise/dist/spromise.min"));

      beforeEach(function () {
        createBundler({ exportNames: ["spromise/dist/spromise.min"] });

        return bitbundler.bundle({ src: "test/sample/X.js" }).then(function (ctx) {
          result = ctx;
        });
      });

      it("then result in the main bundle contains correct content", function () {
        var expected = [
          `require=_bb$iter=(${BUNDLE_MODULE_LOADER})({`,
          `${wrapModule(entry, 1, { "./Y": 2 }, "test/sample/X.js")},`,
          `${wrapModule(dep2, 2, { "./z": 3, "./X": 1 }, "test/sample/Y.js")},`,
          `${wrapModule(dep3, 3, { "spromise/dist/spromise.min": "spromise/dist/spromise.min" }, "test/sample/z.js")},`,
          `${wrapModule(spromiseContent, '"spromise/dist/spromise.min"', {}, "node_modules/spromise/dist/spromise.min.js")}`,
          "},[1]);",
          "",
          ""
        ].join("\n");

        expect(combineSourceMap.removeComments(result.getBundles("main").content.toString())).to.be.equal(expected);
      });
    });

    describe("bundling with exportNames object that maps to 'Promise'", function () {
      var result;
      const entry = readModule.fromFilePath("test/sample/X.js");
      const dep2 = readModule.fromFilePath("test/sample/Y.js");
      const dep3 = readModule.fromFilePath("test/sample/z.js");
      const spromiseContent = trimResult(readModule.fromModuleName("spromise/dist/spromise.min"));

      beforeEach(function () {
        createBundler({ exportNames: { "spromise/dist/spromise.min": "Promise" } });

        return bitbundler.bundle({ src: "test/sample/X.js" }).then(function (ctx) {
          result = ctx;
        });
      });

      it("then result in the main bundle contains correct content", function () {
        var expected = [
          `require=_bb$iter=(${BUNDLE_MODULE_LOADER})({`,
          `${wrapModule(entry, 1, { "./Y": 2 }, "test/sample/X.js")},`,
          `${wrapModule(dep2, 2, { "./z": 3, "./X": 1 }, "test/sample/Y.js")},`,
          `${wrapModule(dep3, 3, { "spromise/dist/spromise.min": "Promise" }, "test/sample/z.js")},`,
          `${wrapModule(spromiseContent, '"Promise"', {}, "node_modules/spromise/dist/spromise.min.js")}`,
          "},[1]);",
          "",
          ""
        ].join("\n");

        expect(combineSourceMap.removeComments(result.getBundles("main").content.toString())).to.be.equal(expected);
      });
    });
  });

  describe("bundling pipeline and event emitting tests", function () {
    let buildInit, buildStart, buildEnd, writeSuccess, writeFailure;

    beforeEach(function () {
      createBundler();
      sinon.spy(bitbundler, "buildBundles");
      sinon.spy(bitbundler.loader, "hasModule");
      sinon.spy(bitbundler.loader, "getModule");
      sinon.spy(bitbundler.loader, "deleteModule");
      sinon.spy(bitbundler.loader, "fetch");
      sinon.spy(bitbundler.bundler, "bundle");

      buildInit = sinon.stub();
      buildStart = sinon.stub();
      buildEnd = sinon.stub();
      writeSuccess = sinon.stub();
      writeFailure = sinon.stub();

      bitbundler
        .on("build-init", buildInit)
        .on("build-start", buildStart)
        .on("build-end", buildEnd)
        .on("write-success", writeSuccess)
        .on("write-failure", writeFailure);
    });

    describe("bundle javascript content that does not produce a bundle", function () {
      let destStub;
      const bundleContent = "console.log('hello world');";

      beforeEach(function () {
        // dest is a stream and streams have a write function with arguments:
        // 1. the content to write
        // 2. callback that is called when the stream is done writing.
        //
        // The stub setup below will cause the callback to be called by sinon
        // so that we can tell the bundler that we are done writing the bundle.
        destStub = {
          write: sinon.stub().callsArg(1),
        };

        bitbundler.bundler.bundle = sinon.stub().resolves(createMockEmptyContext());
        return bitbundler.bundle({ src: { content: bundleContent }, dest: destStub });
      });

      it("then initBuild event handler is called", function () {
        sinon.assert.called(buildInit);
      });

      it("then preBuild event handler is called", function () {
        sinon.assert.called(buildStart);
      });

      it("then postBuild event handler is called", function () {
        sinon.assert.called(buildEnd);
      });

      it("then writeSucess event handler is not called", function () {
        // write success is only called when there is content to be
        // written. But since this test mockes out the bundle context
        // so that there is no bundle content, then write success is
        // never triggered.
        sinon.assert.notCalled(writeSuccess);
      });

      it("then dest.write function is NOT called", function () {
        sinon.assert.notCalled(destStub.write);
      });
    });

    describe("bundle javascript content and success write", function () {
      let destStub;
      const bundleContent = "console.log('hello world');";

      beforeEach(function () {
        // dest is a stream and streams have a write function with arguments:
        // 1. the content to write
        // 2. callback that is called when the stream is done writing.
        //
        // The stub setup below will cause the callback to be called by sinon
        // so that we can tell the bundler that we are done writing the bundle.
        destStub = {
          write: sinon.stub().callsArg(1),
        };

        return bitbundler.bundle({ src: { content: bundleContent }, dest: destStub });
      });

      it("then initBuild event handler is called", function () {
        sinon.assert.called(buildInit);
      });

      it("then preBuild event handler is called", function () {
        sinon.assert.called(buildStart);
      });

      it("then postBuild event handler is called", function () {
        sinon.assert.called(buildEnd);
      });

      it("then writeSucess event handler is called", function () {
        sinon.assert.called(writeSuccess);
      });

      it("then writeFailure event handler is never called", function () {
        sinon.assert.notCalled(writeFailure);
      });

      it("then dest.write function is called", function () {
        sinon.assert.called(destStub.write);
      });

      it("then loader.hasModule is not called", function () {
        sinon.assert.notCalled(bitbundler.loader.hasModule);
      });

      it("then loader.deleteModule is not called", function () {
        sinon.assert.notCalled(bitbundler.loader.deleteModule);
      });

      it("then buildBundles is called with the corresponding content", function () {
        sinon.assert.calledWith(bitbundler.buildBundles, sinon.match.has("src", sinon.match(items => items[0].content === bundleContent)));
      });

      it("then loader.fetch is called", function () {
        sinon.assert.called(bitbundler.loader.fetch);
      });

      it("then bundler.bundle is called", function () {
        sinon.assert.called(bitbundler.bundler.bundle);
      });
    });

    describe("bundle javascript content and failed write", function () {
      let destStub, stubWriteError, errorFromWrite, stderrStub;
      const bundleContent = "console.log('hello world');";

      beforeEach(function () {
        stubWriteError = new Error("test error when writing bundle");

        // dest is a stream and streams have a write function with arguments:
        // 1. the content to write
        // 2. callback that is called when the stream is done writing.
        //
        // The stub setup below will cause the callback to be called by sinon
        // so that we can tell the bundler that we are done writing the bundle.
        destStub = {
          write: sinon.stub().callsArgWith(1, stubWriteError),
        };

        // We stub out stderr.write so that tests dont get noisy output from
        // logging the promise rejection from failing the bundle writing.
        stderrStub = sinon.stub();
        process.stderr.write = stderrStub;

        return bitbundler
          .bundle({ src: { content: bundleContent }, dest: destStub })
          .catch((e) => {
            // the writer will reject the promise... So we catch it here
            // to let the test continue to run.
            errorFromWrite = e;
          });
      });

      it("then we get an error from the bundle write", function () {
        expect(errorFromWrite).to.be.equal(stubWriteError);
      });

      it("then initBuild event handler is called", function () {
        sinon.assert.called(buildInit);
      });

      it("then preBuild event handler is called", function () {
        sinon.assert.called(buildStart);
      });

      it("then postBuild event handler is called", function () {
        sinon.assert.called(buildEnd);
      });

      it("then writeSucess event handler is called", function () {
        sinon.assert.notCalled(writeSuccess);
      });

      it("then writeFailure event handler is never called", function () {
        sinon.assert.called(writeFailure);
      });

      it("then dest.write function is called", function () {
        sinon.assert.called(destStub.write);
      });
    });

    describe("bundle javascript content with a dependency", function () {
      const bundleContent = "require('./z');console.log('hello world');";
      const bundleContentPath = path.join(__dirname, "../sample/");

      beforeEach(function () {
        return bitbundler.bundle({ content: bundleContent, path: bundleContentPath });
      });

      it("then initBuild event handler is called", function () {
        sinon.assert.called(buildInit);
      });

      it("then preBuild event handler is called", function () {
        sinon.assert.called(buildStart);
      });

      it("then postBuild event handler is called", function () {
        sinon.assert.called(buildEnd);
      });

      it("then loader.hasModule is not called", function () {
        sinon.assert.notCalled(bitbundler.loader.hasModule);
      });

      it("then loader.deleteModule is not called", function () {
        sinon.assert.notCalled(bitbundler.loader.deleteModule);
      });

      it("then buildBundles is called with the corresponding content", function () {
        sinon.assert.calledWith(bitbundler.buildBundles, sinon.match.has("src", sinon.match(items => items[0].content === "require('./z');console.log('hello world');")));
      });

      it("then buildBundles is called with the corresponding path", function () {
        sinon.assert.calledWith(bitbundler.buildBundles, sinon.match.has("src", sinon.match(items => /\/test\/sample\/$/.test(items[0].path))));
      });

      it("then loader.fetch is called", function () {
        sinon.assert.called(bitbundler.loader.fetch);
      });

      it("then bundler.bundle is called", function () {
        sinon.assert.called(bitbundler.bundler.bundle);
      });
    });

    describe("bundle with one file", function () {
      let context;
      beforeEach(function () {
        context = createMockEmptyContext();
        bitbundler.bundler.bundle = sinon.stub().resolves(context);
        return bitbundler.bundle(["test/sample/X.js"]);
      });

      it("then initBuild event handler is called", function () {
        sinon.assert.called(buildInit);
      });

      it("then preBuild event handler is called", function () {
        sinon.assert.called(buildStart);
      });

      it("then postBuild event handler is called", function () {
        sinon.assert.called(buildEnd);
      });

      it("then loader.hasModule is called", function () {
        sinon.assert.called(bitbundler.loader.hasModule);
      });

      it("then loader.getModule is not called", function () {
        sinon.assert.notCalled(bitbundler.loader.getModule);
      });

      it("then loader.deleteModule is not called", function () {
        sinon.assert.notCalled(bitbundler.loader.deleteModule);
      });

      it("then buildBundles is called with the corresponding file names", function () {
        sinon.assert.calledWith(bitbundler.buildBundles, sinon.match.has("src", sinon.match(arrayItemContains("test/sample/X.js"))));
      });

      it("then loader.fetch is called", function () {
        sinon.assert.called(bitbundler.loader.fetch);
      });

      it("then bundler.bundle is called", function () {
        sinon.assert.called(bitbundler.bundler.bundle);
      });

      it("then visitBundles is called", function () {
        sinon.assert.called(context.visitBundles);
      });
    });

    describe("bundle update with one file", function () {
      var file, context;

      beforeEach(function () {
        file = new BitBundler.File("test/sample/X.js");
        bitbundler.loader.hasModule.restore();
        bitbundler.loader.getModule.restore();
        bitbundler.loader.deleteModule.restore();
        bitbundler.loader.hasModule = sinon.stub();
        bitbundler.loader.getModule = sinon.stub();
        bitbundler.loader.deleteModule = sinon.stub();

        context = createMockEmptyContext();
        bitbundler.context = context;
        file.src.forEach((filePath) => bitbundler.loader.hasModule.withArgs(filePath).returns(true));
        return bitbundler.update(file);
      });

      it("then initBuild event handler is NOT called", function () {
        sinon.assert.notCalled(buildInit);
      });

      it("then preBuild event handler is called", function () {
        sinon.assert.called(buildStart);
      });

      it("then postBuild event handler is called", function () {
        sinon.assert.called(buildEnd);
      });

      it("then loader.hasModule is called", function () {
        sinon.assert.called(bitbundler.loader.hasModule);
      });

      it("then loader.getModule is called", function () {
        sinon.assert.called(bitbundler.loader.getModule);
      });

      it("then loader.deleteModule is called", function () {
        sinon.assert.called(bitbundler.loader.deleteModule);
      });

      it("then buildBundles is called with the corresponding file names", function () {
        sinon.assert.calledWith(bitbundler.buildBundles, sinon.match.has("src", sinon.match(arrayItemContains("test/sample/X.js"))));
      });

      it("then loader.fetch is called", function () {
        sinon.assert.called(bitbundler.loader.fetch);
      });

      it("then bundler.bundle is called", function () {
        sinon.assert.called(bitbundler.bundler.bundle);
      });

      it("then visitBundles is called", function () {
        sinon.assert.called(context.visitBundles);
      });
    });

    describe("bundle failures", function () {
      beforeEach(function () {
        bitbundler.buildBundles = sinon.stub().rejects("bad");
        return bitbundler.bundle(["test/sample/X.js"]).catch(function () { });
      });

      it("then initBuild event handler is called", function () {
        sinon.assert.called(buildInit);
      });

      it("then preBuild event handler is called", function () {
        sinon.assert.called(buildStart);
      });

      it("then postBuild event handler is called", function () {
        sinon.assert.called(buildEnd);
      });
    });
  });

  describe("bundling notification tests", () => {
    describe("single notification function", function () {
      var notificationStub, initBuildStub, context;

      beforeEach(function () {
        initBuildStub = sinon.stub();
        notificationStub = sinon.stub().returns({ "build-init": initBuildStub });
        createBundler({ notifications: notificationStub });

        context = createMockEmptyContext();
        bitbundler.buildBundles = sinon.stub().resolves(context);

        return bitbundler.bundle(["test/sample/X.js"]);
      });

      it("then the notification function is called", function () {
        sinon.assert.called(notificationStub);
      });

      it("then the registered build-init callback is called", function () {
        sinon.assert.called(initBuildStub);
      });
    });

    describe("multiple notification functions", function () {
      var notificationStub1, notificationStub2, buildInitStub1, buildInitStub2, context;

      beforeEach(function () {
        buildInitStub1 = sinon.stub();
        buildInitStub2 = sinon.stub();
        notificationStub1 = sinon.stub().returns({ "build-init": buildInitStub1 });
        notificationStub2 = sinon.stub().returns({ "build-init": buildInitStub2 });
        createBundler({ notifications: [notificationStub1, notificationStub2] });

        context = createMockEmptyContext();
        bitbundler.buildBundles = sinon.stub().resolves(context);

        return bitbundler.bundle(["test/sample/X.js"]);
      });

      it("then the first notification function is called", function () {
        sinon.assert.called(notificationStub1);
      });

      it("then the second notification function is called", function () {
        sinon.assert.called(notificationStub2);
      });

      it("then the first registered build-init callback is called", function () {
        sinon.assert.called(buildInitStub1);
      });

      it("then the second registered build-init callback is called", function () {
        sinon.assert.called(buildInitStub2);
      });
    });
  });
});

function createMockEmptyContext() {
  var context = {
    cache: {},
    getBundles: () => ({ setModules: () => ({}) }),
    setBundle: () => context,
    setCache: () => context,
    visitBundles: sinon.stub().returns(context)
  };

  return context;
}

function arrayItemContains(value) {
  return function (array) {
    return array.find(function (str) {
      return str.indexOf(value) !== -1;
    });
  };
}

function trimResult(data) {
  return data
    .toString()
    .replace(/\/\/# sourceMappingURL=.*/, "");
}
