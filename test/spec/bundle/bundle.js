import Bundle from "../../../src/bundle";
import { expect } from "chai";

describe("Bundle test suite", () => {

  describe("When creating Bundle", () => {
    describe("with no settings", () => {
      let bundle = null;

      before(() => {
        bundle = new Bundle();
      });

      it("then the bundle is empty", () => {
        expect(bundle).to.deep.equal({
          name: undefined,
          dest: false,
          entries: []
        });
      });

      it("setting the name of the bundle", () => {
        expect(bundle.setName("new name")).to.deep.equal({
          name: "new name",
          dest: false,
          entries: []
        });
      });

      it("setting the dest", () => {
        expect(bundle.setDest("new-dest.js")).to.deep.equal({
          name: undefined,
          dest: "new-dest.js",
          entries: []
        });
      });

      it("setting the entries", () => {
        expect(bundle.setEntries("new-entry.js")).to.deep.equal({
          name: undefined,
          dest: false,
          entries: ["new-entry.js"]
        });
      });
    });

    describe("with a name and no options", () => {
      let bundle = null;

      before(() => {
        bundle = new Bundle("Random bundle name");
      });

      it("then the bundle is empty", () => {
        expect(bundle).to.deep.equal({
          name: "Random bundle name",
          dest: false,
          entries: []
        });
      });
    });

    describe("with a name and options", () => {
      let bundle = null;

      describe("with destination", () => {
        before(() => {
          bundle = new Bundle("Random bundle name", {
            dest: "some-destination-file.js"
          });
        });

        it("then the bundle has a proper dest", () => {
          expect(bundle).to.deep.equal({
            name: "Random bundle name",
            dest: "some-destination-file.js",
            entries: []
          });
        });
      });

      describe("with no dest and a name that looks like a file name", () => {
        before(() => {
          bundle = new Bundle("name-that-looks-like-a-file.js");
        });

        it("then the bundle has a proper dest", () => {
          expect(bundle).to.deep.equal({
            name: "name-that-looks-like-a-file.js",
            dest: "name-that-looks-like-a-file.js",
            entries: []
          });
        });
      });

      describe("with dest and a name that looks like a file name", () => {
        before(() => {
          bundle = new Bundle("name-that-looks-like-a-file.js", {
            dest: "destination.js"
          });
        });

        it("then the bundle has a proper dest", () => {
          expect(bundle).to.deep.equal({
            name: "name-that-looks-like-a-file.js",
            dest: "destination.js",
            entries: []
          });
        });
      });

    });
  });
});
