function messageBuilder(chunk) {
  return Object
    .keys(chunk.data)
    .map(function(key) {
      var val = chunk.data[key];

      return typeof val === "string" ? val :
        Buffer.isBuffer(val) ? val.toString() :
        JSON.stringify(val);
    });
}

module.exports = messageBuilder;
