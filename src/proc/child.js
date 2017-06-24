var childProcessApi;

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
      initProcess(message);
      break;
    default:
      processMessage(message);
      break;
  }
});

function initProcess(message) {
  try {
    childProcessApi = require(message.data);

    // If the result of the loading the module is a function or class
    // then we try to instantiate it.
    if (typeof childProcessApi === "function") {
      childProcessApi = new childProcessApi();
    }

    handleSuccess(message)();
  }
  catch(ex) {
    handlerError(message)(ex);
  }
}

function processMessage(message) {
  try {
    var deferred = childProcessApi[message.type](message.data,
      (err, data) => err ? handleError(message)(err) : handleSuccess(message)(data)
    );

    if (deferred) {
      deferred.then(handleSuccess(message), handlerError(message));
    }
  }
  catch(ex) {
    handlerError(message)(ex);
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
