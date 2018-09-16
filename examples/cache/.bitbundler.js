/**
 * By default the cache plugin will save and load from disk. But you can create/configure
 * cache connectors to use other data sources. The code commented out in the cache plugin
 * configuration is for caching data out to elasticsearch.
 */

// const redisConnector = require("@bit/loader-cache/connectors/redis");
// const esConnector = require("@bit/loader-cache/connectors/elasticsearch");

module.exports = {
  src: "src/main.js",
  dest: "dist/out.js",

  loader: [
    "@bit/loader-babel",
    ["@bit/loader-cache", {
      // connector: redisConnector()
      // connector: esConnector({
      //   host: "localhost:9200",
      //   index: "cache_example",
      //   type: "modules"
      // })
    }]
  ]
};
