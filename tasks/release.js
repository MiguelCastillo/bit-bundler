module.exports = {
  options: {
    tagName: "v<%= version %>",
    tagMessage: "Version <%= version %>",
    commitMessage: "Release v<%= version %>",
    afterBump: ["build"]
  }
};
