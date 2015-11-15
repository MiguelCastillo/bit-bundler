//
// http://24ways.org/2013/grunt-is-not-weird-and-hard/
//
module.exports = function(grunt) {
  "use strict";

  require("load-grunt-tasks")(grunt);

  var date = new Date();
  var today = date.toDateString() + " " + date.toLocaleTimeString();
  var pkg = require("./package.json");
  var banner = "/*! <%= pkg.name %> v<%= pkg.version %> - " + today + ". (c) " + date.getFullYear() + " Miguel Castillo. Licensed under MIT */";

  grunt.initConfig({
    pkg: pkg,
    connect: {
      test: {
        options: {
          port: 8912,
          hostname: "localhost"
        }
      },
      keepalive: {
        options: {
          port: 8919,
          host: "localhost",
          keepalive: true,
          open: "http://localhost:8919/test/SpecRunner.html"
        }
      }
    },
    mocha: {
      test: {
        options: {
          log: true,
          logErrors: true,
          reporter: "Spec",
          run: false,
          timeout: 10000,
          urls: ["http://localhost:8912/test/SpecRunner.html"]
        }
      }
    },
    watch: {
      build: {
        files: ["src/**/*.js", "test/**/*.js", "*.js"],
        tasks: ["build"],
        options: {
          livereload: true
        }
      }
    },
    eslint: {
      all: {
        options: {
          //format: require("eslint-tap")
        },
        src: ["src/**/*.js", "test/**/*.js", "*.js"]
      }
    },
    concurrent: {
      build: {
        tasks: ["connect:keepalive", "watch:build"],
        options: {
          logConcurrentOutput : true
        }
      }
    },
    browserify: {
      build: {
        files: {
          "dist/index.js": ["src/index.js"]
        },
        options: {
          banner: banner,
          browserifyOptions: {
            detectGlobals: false,
            standalone: "<%= pkg.name %>"
          }
        }
      }
    },
    uglify: {
      build: {
        options: {
          preserveComments: "some",
          sourceMap: true
        },
        files: {
          "dist/index.min.js": ["dist/index.js"]
        }
      }
    },
    release: {
      options: {
        tagName: "v<%= version %>",
        tagMessage: "Version <%= version %>",
        commitMessage: "Release v<%= version %>",
        afterBump: ["build"]
      }
    }
  });

  grunt.registerTask("build", ["eslint:all", "browserify:build", "uglify:build"]);
  grunt.registerTask("serve", ["build", "concurrent:build"]);
  grunt.registerTask("test", ["connect:test", "mocha:test"]);
};
