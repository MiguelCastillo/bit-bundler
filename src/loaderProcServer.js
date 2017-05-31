var Loader = require("./loader");
var loader;

process.on("message", function(message) {
  switch(message.content.type) {
    case "init":
      loader = new Loader(message.content.data);
      process.send({ id: message.id });
      break;
    case "resolve":
      loader
        .resolve(message.content.data.name, message.content.data.referrer)
        .then(handleSuccess(message), handlerError(message))
        break;
    case "fetch":
      loader
        .fetch(message.content.data.name, message.content.data.referrer)
        .then(handleSuccess(message), handlerError(message));
      break;
    case "fetchShallow":
      loader
        .fetchShallow(message.content.data.name, message.content.data.referrer)
        .then(handleSuccess(message), handlerError(message));
      break;
  }
});

function handleSuccess(message) {
  return function(data) {
    process.send({
      id: message.id,
      data: data
    });
  };
}

function handlerError(message) {
  return function(error) {
    //
    // TODO: Error isn't properly serializing when it is of type Error.
    // Gotta make sure to smooth that out soon.
    //
    process.send({
      id: message.id,
      error: error || "Unknown error"
    });
  };
}
