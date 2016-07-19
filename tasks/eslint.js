module.exports = {
  all: {
    options: {
      //format: require("eslint-tap")
    },
    src: ["src/**/*.js", "test/**/*.js", "!test/dest/**/*.js", "*.js"]
  }
};
