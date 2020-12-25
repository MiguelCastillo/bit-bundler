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

  describe("When creating a bundler with no configuration", function () {
    beforeEach(function () {
      createBundler();
    });

    it("then the bundler is an instance of Bundler", function () {
      expect(bitbundler).to.be.an.instanceof(BitBundler);
    });

    describe("and bundling a module with a couple of dependencies and no bundle destination", function () {
      var result;
      const entry = readModule.fromFilePath("test/sample/X.js");
      const dep2 = readModule.fromFilePath("test/sample/Y.js");
      const dep3 = readModule.fromFilePath("test/sample/z.js");
      const spromiseContent = trimResult(readModule.fromModuleName("spromise/dist/spromise.min"));

      beforeEach(function () {
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

    describe("and bundling a module with a couple of dependencies with a bundle destination", function () {
      var result;
      const entry = readModule.fromFilePath("test/sample/X.js");
      const dep2 = readModule.fromFilePath("test/sample/Y.js");
      const dep3 = readModule.fromFilePath("test/sample/z.js");
      const spromiseContent = trimResult(readModule.fromModuleName("spromise/dist/spromise.min"));

      beforeEach(function () {
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

    describe("and bundle a node built module", function () {
      var result, error;

      beforeEach(function () {
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

    describe("and bundle with a dependency that does not exist", function () {
      var result, error;

      beforeEach(function () {
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
  });

  describe("When bundling content", function () {
    beforeEach(function () {
      createBundler();
    });

    describe("And the bundle content has no dependencies", function () {
      const bundleContent = "console.log('hello world');";
      var result;

      beforeEach(function () {
        return bitbundler.bundle({ src: { content: bundleContent } }).then(ctx => result = ctx);
      });

      it("then the bundle contains the expected content", function () {
        expect(result.shards["main"].content.toString()).to.include("console.log('hello world');");
      });
    });

    describe("And the bundle content has 1 relative dependency", function () {
      const bundleContent = "require('../sample/z');console.log('hello world');";
      const bundleContentPath = path.join(__dirname, "../sample/");
      var result;

      beforeEach(function () {
        return bitbundler.bundle({ src: { content: bundleContent, path: bundleContentPath } }).then(ctx => result = ctx);
      });

      it("then the bundle contains the expected content", function () {
        expect(result.shards["main"].content.toString()).to.include(`roast: "this",\n  potatoes`);
      });
    });
  });

  describe("When bundling with exportNames", function () {
    var exportNamesConfig, act;

    beforeEach(function () {
      act = () => createBundler({ exportNames: exportNamesConfig });
    });

    describe("and exportNames is 'true'", function () {
      var result;
      const entry = readModule.fromFilePath("test/sample/X.js");
      const dep2 = readModule.fromFilePath("test/sample/Y.js");
      const dep3 = readModule.fromFilePath("test/sample/z.js");
      const spromiseContent = trimResult(readModule.fromModuleName("spromise/dist/spromise.min"));

      beforeEach(function () {
        exportNamesConfig = true;
        act();
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

    describe("and exportNames is an Array", function () {
      var result;
      const entry = readModule.fromFilePath("test/sample/X.js");
      const dep2 = readModule.fromFilePath("test/sample/Y.js");
      const dep3 = readModule.fromFilePath("test/sample/z.js");
      const spromiseContent = trimResult(readModule.fromModuleName("spromise/dist/spromise.min"));

      beforeEach(function () {
        exportNamesConfig = ["spromise/dist/spromise.min"];
        act();
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

    describe("and exportNames is an object that maps to 'Promise'", function () {
      var result;
      const entry = readModule.fromFilePath("test/sample/X.js");
      const dep2 = readModule.fromFilePath("test/sample/Y.js");
      const dep3 = readModule.fromFilePath("test/sample/z.js");
      const spromiseContent = trimResult(readModule.fromModuleName("spromise/dist/spromise.min"));

      beforeEach(function () {
        exportNamesConfig = { "spromise/dist/spromise.min": "Promise" };
        act();
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

  describe("Given a bundler", function () {
    var context, buildInit, buildStart, buildEnd;

    beforeEach(function () {
      createBundler();
      context = createMockContext();
      bitbundler.context = context;

      sinon.spy(bitbundler, "emit");
      sinon.spy(bitbundler, "buildBundles");
      bitbundler.loader.hasModule = sinon.stub();
      bitbundler.loader.getModule = sinon.stub();
      bitbundler.loader.deleteModule = sinon.stub();
      bitbundler.loader.fetch = sinon.stub().resolves();
      bitbundler.bundler.bundle = sinon.stub().resolves(context);

      buildInit = sinon.stub();
      buildStart = sinon.stub();
      buildEnd = sinon.stub();

      bitbundler
        .on("build-init", buildInit)
        .on("build-start", buildStart)
        .on("build-end", buildEnd);
    });

    describe("And creating a bundle from javascript content", function () {
      const bundleContent = "console.log('hello world');";

      beforeEach(function () {
        return bitbundler.bundle({ src: { content: bundleContent } });
      });

      it("then emit is called with `build-init`", function () {
        sinon.assert.calledWith(bitbundler.emit, "build-init");
      });

      it("then emit is called with `build-start`", function () {
        sinon.assert.calledWith(bitbundler.emit, "build-start");
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
        sinon.assert.calledWith(bitbundler.buildBundles, sinon.match.has("src", sinon.match(items => items[0].content === bundleContent)));
      });

      it("then loader.fetch is called", function () {
        sinon.assert.called(bitbundler.loader.fetch);
      });

      it("then bundler.bundle is called", function () {
        sinon.assert.called(bitbundler.bundler.bundle);
      });
    });

    describe("And creating a bundle from javascript content with a dependency", function () {
      const bundleContent = "require('./z');console.log('hello world');";
      const bundleContentPath = path.join(__dirname, "../sample/");

      beforeEach(function () {
        return bitbundler.bundle({ content: bundleContent, path: bundleContentPath });
      });

      it("then emit is called with `build-init`", function () {
        sinon.assert.calledWith(bitbundler.emit, "build-init");
      });

      it("then emit is called with `build-start`", function () {
        sinon.assert.calledWith(bitbundler.emit, "build-start");
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

    describe("And creating a bundle with one file", function () {
      beforeEach(function () {
        return bitbundler.bundle(["test/sample/X.js"]);
      });

      it("then emit is called with `build-init`", function () {
        sinon.assert.calledWith(bitbundler.emit, "build-init");
      });

      it("then emit is called with `build-start`", function () {
        sinon.assert.calledWith(bitbundler.emit, "build-start");
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

    describe("And updating a bundle with one file", function () {
      var file;

      beforeEach(function () {
        file = new BitBundler.File("test/sample/X.js");
        file.src.forEach((filePath) => bitbundler.loader.hasModule.withArgs(filePath).returns(true));
        return bitbundler.update(file);
      });

      it("then emit is called with `build-init`", function () {
        sinon.assert.neverCalledWith(bitbundler.emit, "build-init");
      });

      it("then emit is called with `build-start`", function () {
        sinon.assert.calledWith(bitbundler.emit, "build-start");
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

    describe("And bundling fails", function () {
      beforeEach(function () {
        bitbundler.buildBundles = sinon.stub().rejects("bad");
        return bitbundler.bundle(["test/sample/X.js"]).catch(function () { });
      });

      it("then emit is called with `build-init`", function () {
        sinon.assert.calledWith(bitbundler.emit, "build-init");
      });

      it("then emit is called with `build-start`", function () {
        sinon.assert.calledWith(bitbundler.emit, "build-start");
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

  describe("Given a bundler with a single function notifications configured", function () {
    var notificationStub, initBuildStub, context;

    beforeEach(function () {
      initBuildStub = sinon.stub();
      notificationStub = sinon.stub().returns({ "build-init": initBuildStub });
      createBundler({ notifications: notificationStub });

      sinon.spy(bitbundler, "emit");
      context = createMockContext();
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

  describe("Given a bundler with multiple function notifications configured", function () {
    var notificationStub1, notificationStub2, buildInitStub1, buildInitStub2, context;

    beforeEach(function () {
      buildInitStub1 = sinon.stub();
      buildInitStub2 = sinon.stub();
      notificationStub1 = sinon.stub().returns({ "build-init": buildInitStub1 });
      notificationStub2 = sinon.stub().returns({ "build-init": buildInitStub2 });
      createBundler({ notifications: [notificationStub1, notificationStub2] });

      sinon.spy(bitbundler, "emit");
      context = createMockContext();
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

  describe("Given a bundler with a single notification configured", function () {
    var context, initBuildStub;

    beforeEach(function () {
      initBuildStub = sinon.stub();

      createBundler({
        notifications: {
          "build-init": initBuildStub
        }
      });

      sinon.spy(bitbundler, "emit");
      context = createMockContext();
      bitbundler.buildBundles = sinon.stub().resolves(context);

      return bitbundler.bundle(["test/sample/X.js"]);
    });

    it("then build-init callback is called", function () {
      sinon.assert.called(initBuildStub);
    });
  });
});

function createMockContext() {
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

