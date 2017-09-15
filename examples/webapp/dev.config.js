module.exports = {
  apps : [{
    name: "assets",
    script: "npm",
    args: "run assets -- --watch",
    watch: false
  }, {
    name: "server",
    script: "npm",
    args: "run server",
    watch: [".3dub.js"],
    ignore_watch: ["node_modules"]
  }, {
    name: "build",
    script: "npm",
    args: "run build -- --watch",
    watch: [".bitbundler.js"],
    ignore_watch: ["node_modules"],
    env: {
      "NODE_ENV": "development",
    },
    env_production : {
      "NODE_ENV": "production"
    }
  }]
};
