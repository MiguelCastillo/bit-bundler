module.exports = {
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
};