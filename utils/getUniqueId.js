var ids = {};
var idCounter = 1;

function getUniqueId(id) {
  if (!ids[id]) {
    ids[id] = idCounter++;
  }

  return ids[id];
}

module.exports = getUniqueId;
