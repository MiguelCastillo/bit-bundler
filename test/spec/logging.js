/*eslint quotes: ["off"]*/

import { expect } from "chai";
import es from "event-stream";
import fs from "fs";
import path from "path";
import BitBundler from "../../src/index";

describe("Logging test suite", function () {
  var bitbundler, actualLogging;

  describe("When streaming bundler and loader default messages without log dates", function () {
    beforeEach(function () {
      actualLogging = "";
      bitbundler = new BitBundler({
        log: {
          stream: es.through(function(chunk) {
            actualLogging += chunk.name + ";";
            this.emit("data", chunk);
          })
        }
      });
    });

    describe("and bundling a module with a couple of dependencies", function () {
      var expectedLogging = "";
      beforeEach(function () {
        expectedLogging = fs.readFileSync(path.join(__dirname, "../logging/default-messages.txt")).toString();
        return bitbundler.bundle("test/sample/X.js");
      });

      it("then result in the main bundle contains correct content", function () {
        expect(expectedLogging).to.be.equal(actualLogging);
      });
    });
  });
});
