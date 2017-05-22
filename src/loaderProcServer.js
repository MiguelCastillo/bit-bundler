var Loader = require("./loader");
var loader;

process.on("message", function(message) {
  switch(message.type) {
    case "init":
      loader = new Loader(message.data);
      process.send({ id: message.id });
      break;
    case "fetch":
      loader
        .fetch(message.data.name)
        .then(function(module) {
          process.send({
            id: message.id,
            data: {
              module: module,
              cache: loader.cache
            }
          });
        })
        .catch(function(error) {
          process.send({
            id: message.id,
            error: error
          });
        });
      break;
    case "delete":
      loader.deleteModule(module.data.id);
      process.send({ id: message.id });
      break;
  }
});
