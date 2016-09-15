function messageBuilder(chunk) {
  return Object
    .keys(chunk.data)
    .map(function(key) {
      var val = chunk.data[key];

      return typeof val === "string" ? val :
        Buffer.isBuffer(val) ? val.toString() :
        val instanceof Error ? val.stack : JSON.stringify(val);
    });
}

module.exports = messageBuilder;
