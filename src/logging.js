const logger = require("loggero");
const Bitloader = require("@bit/loader");
const tap = require("./shimmer").tap;

// We patch in a stream in bit-loader so that all messages are written
// to the same stream. 
tap(logger, "pipe", (stream) => {
    Bitloader.logger.pipe(stream);
});

tap(logger, "enableAll", () => {
    Bitloader.logger.enableAll();
});

tap(logger, "disableAll", () => {
    Bitloader.logger.disableAll();
});

module.exports = logger.enableAll();
