import Context from "../../src/context.js";
import { expect } from "chai";

describe("Context test suite", () => {
  let context = null;

  before(() => {
    context = new Context();
  });


  describe("When creating Context", () => {
    it("then the context is empty", () => {
      expect(context).to.deep.equal({
        cache: {},
        exclude: [],
        shards: {}
      });
    });
  });


  describe("When configuring file exclusions", () => {
    describe("and adding one exclusion", () => {
      it("then the exclude exists in the context", () => {
        expect(context.addExclude("file1")).to.deep.equal({
          cache: {},
          exclude: ["file1"],
          shards: {}
        });
      });
    });

    describe("and adding two exclusions", () => {
      it("then the excludes exists in the context", () => {
        expect(context.addExclude(["file1", "file2"])).to.deep.equal({
          cache: {},
          exclude: ["file1", "file2"],
          shards: {}
        });
      });
    });

    describe("and adding duplciate excludes", () => {
      it("then only one exclude exists in the context", () => {
        expect(context.addExclude(["file1", "file1", "file1"])).to.deep.equal({
          cache: {},
          exclude: ["file1"],
          shards: {}
        });
      });
    });
  });


  describe("When configuring modules", () => {
    describe("and setting the cache with no exclusions", () => {
      let updatedContext = null;

      before(() => {
        updatedContext = context.setCache({
          module_1: {
            id: "id1"
          },
          module_2: {
            id: "id2"
          }
        });
      });

      it("then the cache contains all the modules", () => {
        expect(updatedContext).to.deep.equal({
          cache: {
            module_1: {
              id: "id1"
            },
            module_2: {
              id: "id2"
            }
          },
          exclude: [],
          shards: {}
        });
      });

      it("then reading a module that isn't cached returns undefined", () => {
        expect(updatedContext.getModules("module_3")).to.be.undefined;
      });
    });

    describe("and setting the cache with exclusions", () => {
      let updatedContext = null;

      before(() => {
        updatedContext = context.addExclude("module_2").setCache({
            module_1: {
              id: "id1"
            },
            module_2: {
              id: "id2"
            }
          });
      });

      it("then the cache contains only non-excluded modules", () => {
        expect(updatedContext).to.deep.equal({
          cache: {
            module_1: {
              id: "id1"
            }
          },
          exclude: ["module_2"],
          shards: {}
        });
      });

      it("then reading a cached module returns the valid item", () => {
        expect(updatedContext.getModules("module_1")).to.deep.equal({
          id: "id1"
        });
      });

      it("then reading a module that is excluded returns undefined", () => {
        expect(updatedContext.getModules("module_2")).to.be.undefined;
      });
    });
  });


  describe("When configuring bundles", () => {
    let updatedContext = null;

    before(() => {
      updatedContext = context
        .setBundle({
          name: "test_bundle_1"
        })
        .setBundle({
          name: "some_other_bundle_1"
        })
        .setBundle({
          name: "some_other_bundle_2"
        });
    });

    describe("and checking bundle cache", () => {
      it("then all the bundles are in cache", () => {
        expect(updatedContext.shards).to.deep.equal({
          test_bundle_1: {
            dest: false,
            entries: [],
            name: "test_bundle_1",
          },
          some_other_bundle_1: {
            dest: false,
            entries: [],
            name: "some_other_bundle_1",
          },
          some_other_bundle_2: {
            dest: false,
            entries: [],
            name: "some_other_bundle_2",
          }
        });
      });

      it("then cached bundle can be read", () => {
        expect(updatedContext.getBundles("test_bundle_1")).to.deep.equal({
          dest: false,
          entries: [],
          name: "test_bundle_1",
        });
      });

      it("then two cached bundles can be read", () => {
        expect(updatedContext.getBundles(["some_other_bundle_1", "some_other_bundle_2"])).to.deep.equal([
          {
            dest: false,
            entries: [],
            name: "some_other_bundle_1",
          },
          {
            dest: false,
            entries: [],
            name: "some_other_bundle_2",
          }
        ]);
      });

      it("then all cached bundles can be read", () => {
        expect(updatedContext.getBundles()).to.deep.equal([
          {
            dest: false,
            entries: [],
            name: "test_bundle_1",
          },
          {
            dest: false,
            entries: [],
            name: "some_other_bundle_1",
          },
          {
            dest: false,
            entries: [],
            name: "some_other_bundle_2",
          }
        ]);
      });

      it("then reading a non-existing bundle returns undefined", () => {
        expect(updatedContext.getBundles("does_not_exist")).to.undefined;
      });
    });

    it("then the bundles are updated with updateBundles", () => {
      expect(updatedContext.updateBundles(bundle => {
        return {
          entries: [bundle.name + ".js"]
        };
      }))
      .to.deep.equal({
        cache: {},
        exclude: [],
        shards: {
          test_bundle_1: {
            dest: false,
            entries: ["test_bundle_1.js"],
            name: "test_bundle_1"
          },
          some_other_bundle_1: {
            dest: false,
            entries: ["some_other_bundle_1.js"],
            name: "some_other_bundle_1"
          },
          some_other_bundle_2: {
            dest: false,
            entries: ["some_other_bundle_2.js"],
            name: "some_other_bundle_2"
          }
        }
      });
    });

    it("then a bundle can be deleted", () => {
      expect(updatedContext.deleteBundle("test_bundle_1")).to.deep.equal({
        cache: {},
        exclude: [],
        shards: {
          some_other_bundle_1: {
            dest: false,
            entries: [],
            name: "some_other_bundle_1",
          },
          some_other_bundle_2: {
            dest: false,
            entries: [],
            name: "some_other_bundle_2",
          }
        }
      });
    });
  });


});
