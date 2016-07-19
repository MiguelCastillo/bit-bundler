//
// http://24ways.org/2013/grunt-is-not-weird-and-hard/
//
module.exports = function(grunt) {
  "use strict";

  require("load-grunt-tasks")(grunt);
  var pkg = require("./package.json");
  var taskConfig = require("config-grunt-tasks")(grunt, "./tasks");

  taskConfig.pkg = pkg;
  grunt.initConfig(taskConfig);

  grunt.registerTask("build", ["eslint:all"]);
};
