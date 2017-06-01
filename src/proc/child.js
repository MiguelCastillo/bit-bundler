var target;

process.on("message", function(message) {
  switch(message.type) {
    case "__init":
      target = require(message.data);
      process.send({ id: message.id });
      break;
    default:
      processMessage(message);
      break;
  }
});

function processMessage(message) {
  var deferred = target[message.type](message.data, (err, data) => err ? handleError(message)(err) : handleSuccess(message)(data));

  if (deferred) {
    deferred.then(handleSuccess(message), handlerError(message));
  }
}

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
