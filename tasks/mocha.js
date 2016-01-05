module.exports = {
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
};
