module.exports = {
  build: {
    tasks: ["connect:keepalive", "watch:build"],
    options: {
      logConcurrentOutput : true
    }
  }
};
