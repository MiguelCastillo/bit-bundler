var Bitbundler = require("bit-bundler");
var jsPlugin = require("bit-loader-js");
var elasticsearch = require("elasticsearch");
var buildstatus = require("bit-bundler/streams/buildstats");
var crypto = require("crypto");

var bitbundler = new Bitbundler({
  log: buildstatus(),
  loader: {
    plugins: [
      jsPlugin(),
      elasticsearchPlugin()
    ]
  }
});

bitbundler
  .bundle({
    src: "src/main.js",
    dest: "dest/elasticsearch.js"
  })
  .then(function() {
    console.log("done");
  }, function(err) {
    console.log(err && err.stack ? err.stack : err);
  });


/**
 * elasticsearch plugin for reading and writing modules. This includes a checksum
 * to determine the file stored in elasticsearch are current.
 */
function elasticsearchPlugin(options) {
  options = options || {};
  var index = options.index || "bit_bundler_cache";
  var type = options.type || "modules";
  var host = options.host || "localhost:9200";

  var client = new elasticsearch.Client({
    host: host
  });

  var esIndex = client.index({
    index: index,
    type: type,
    body: {}
  });

  return {
    extensions: ["js"],
    pretransform: function(meta) {
      return esIndex.then(function() {
        return client.search({
          index: index,
          type: type,
          body: {
            query: {
              match: {
                _id: meta.path
              }
            }
          }
        })
        .then(function(result) {
          if (result.hits.total) {
            var mod = result.hits.hits[0]._source;
            var hash = getHash(meta.source.toString());

            // Do a hash check on the source to verify if it has changed.
            // If the source has not changed, then we return what is in
            // elasticsearch.
            if (mod.hash === hash) {
              mod.state = "loaded";
              return mod;
            }
            else {
              return {
                hash: hash
              };
            }
          }
        });
      });
    },
    precompile: function(meta) {
      // It would be nice to implement bulk updates.
      return esIndex.then(function() {
        return client.index({
          index: index,
          type: type,
          id: meta.path,
          body: meta
        });
      });
    }
  };
}

function getHash(message) {
  return crypto
    .createHash("sha1")
    .update(message)
    .digest("hex");
}
