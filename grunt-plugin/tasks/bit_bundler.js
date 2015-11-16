/*
 * grunt-bitbundler
 * https://github.com/MiguelCastillo/bit-bundler
 *
 * Copyright (c) 2015 Miguel Castillo
 * Licensed under the MIT license.
 */

"use strict";

var utils = require("belty");
var bitbundler = require("bit-bundler");
var path = require("path");

module.exports = function(grunt) {
  grunt.task.registerMultiTask("bitbundler", "bit bundler grunt plugin", function() {
    var settings = this.data.options || {};
    var done = this.async();

    var allFiles = this.files.reduce(function(container, files) {
      var output = files.dest;
      var input = files.src.map(function(filePath) {
        return path.resolve(filePath);
      });

      bitbundler(utils.merge({files: input}, settings))
        .bundle(settings.browserPack || {},
          function(result) {
            grunt.file.write(output, result);
            done();
          },
          function(err) {
            grunt.log.error(err);
            done(err);
          });

      container.push({
        input: input,
        output: output
      });

      return container;
    }, []);

    if (settings.stats) {
      grunt.log.writeln("Files processed:");
      grunt.log.writeln(JSON.stringify(allFiles));
    }
  });
};
