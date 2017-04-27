module.exports = {
  all: {
    options: {
      //format: require("eslint-tap")
    },
    src: ["src/**/*.js", "loggers/**/*.js", "test/**/*.js", "!test/dest/**/*.js", "*.js"]
  }
};
