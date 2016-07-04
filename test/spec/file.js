import { expect } from "chai";
import File from "../../src/file";

describe("File unit test", function() {
  var act, result, options;

  beforeEach(function() {
    act = () => result = new File(options);
  });

  describe("When creating a File with no options", function() {
    beforeEach(function() {
      options = null;
      act();
    });

    it("then the file has no destination", function() {
      expect(result.dest).to.be.null;
    });

    it("then the file has an empty src", function() {
      expect(result.src).to.be.empty;
    });

    it("then the current directory contains bit-bundler", function() {
      expect(result.cwd).to.contain("/bit-bundler");
    });

    it("then the current directory is the same as the base directory", function() {
      expect(result.cwd).to.be.equal(result.baseDir);
    });
  });

  describe("When creating a File with only a string as the input", function() {
    beforeEach(function() {
      options = "test/spec/index.js";
      act();
    });

    it("then the file has one item in source", function() {
      expect(result.src).to.have.lengthOf(1);
    });

    it("then the source item is a path that contains the input", function() {
      expect(result.src[0]).to.contain("bit-bundler/test/spec/index.js");
    });

    it("then the current directory contains bit-bundler", function() {
      expect(result.cwd).to.contain("/bit-bundler");
    });

    it("then the current directory is the same as the base directory", function() {
      expect(result.cwd).to.be.equal(result.baseDir);
    });
  });

  describe("When creating a File with two strings as the input", function() {
    beforeEach(function() {
      options = ["test/spec/index.js", "test/spec/file.js"];
      act();
    });

    it("then the file has two items in source", function() {
      expect(result.src).to.have.lengthOf(2);
    });

    it("then the first source item is a path that contains the input", function() {
      expect(result.src[0]).to.contain("bit-bundler/test/spec/index.js");
    });

    it("then the second source item is a path that contains the input", function() {
      expect(result.src[1]).to.contain("bit-bundler/test/spec/file.js");
    });

    it("then the current directory contains bit-bundler", function() {
      expect(result.cwd).to.contain("/bit-bundler");
    });

    it("then the current directory is the same as the base directory", function() {
      expect(result.cwd).to.be.equal(result.baseDir);
    });
  });

  describe("When creating a File with two src strings in a configuration object", function() {
    beforeEach(function() {
      options = {
        src: ["test/spec/index.js", "test/spec/file.js"]
      };

      act();
    });

    it("then the file has two items in source", function() {
      expect(result.src).to.have.lengthOf(2);
    });

    it("then the first source item is a path that contains the input", function() {
      expect(result.src[0]).to.contain("bit-bundler/test/spec/index.js");
    });

    it("then the second source item is a path that contains the input", function() {
      expect(result.src[1]).to.contain("bit-bundler/test/spec/file.js");
    });

    it("then the current directory contains bit-bundler", function() {
      expect(result.cwd).to.contain("/bit-bundler");
    });

    it("then the current directory is the same as the base directory", function() {
      expect(result.cwd).to.be.equal(result.baseDir);
    });
  });
});
