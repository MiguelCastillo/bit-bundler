var target;

// Tag the current process as child... For convenience.
Object.defineProperty(process, "isChild", {
  get: function() {
    return true;
  },
  set: function() {
    throw new Error("isChild is a readonly property.");
  }
});

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
    process.send({
      id: message.id,
      error: error ? error.stack || error : "Unknown error"
    });
  };
}
