/**
 * By default the cache plugin will save and load from disk. But you can create/configure
 * cache connectors to use other data sources. The code commented out in the cache plugin
 * configuration is for caching data out to elasticsearch.
 */

// var elasticsearchConnector = require("bit-loader-cache/connectors/elasticsearch");

module.exports = {
  src: "src/main.js",
  dest: "dest/out.js",

  loader: [
    ["bit-loader-cache", {
      // connector: elasticsearchConnector({
      //   host: "localhost:9200",
      //   index: "cache_example",
      //   type: "modules"
      // })
    }]
  ]
};
