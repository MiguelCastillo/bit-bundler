"use strict";

var types = require("dis-isa");


class Type {
  constructor(typeName) {
    this.name = typeName;    
  }

  matchType(value) {
    return this.name === types.typeName(value);
  };
  
  withDefault(value) {
    this.default = value;
    return this;
  };
  
  hasDefault() {
    return this.hasOwnProperty("default");
  }
  
  withTransform(transform) {
    this.transform = transform;
    return this;
  }

  transform(value) {
    return value;
  }
}

class BooleanType extends Type {
  constructor() {
    super(types.typeName(true));
  }

  transform(value) {
    if (!this.matchType(value)) {
      return (
        value === "true" ? true :
        value === "false" ? false :
        Boolean(value)
      );
    }
  
    return value;
  }
}

class NumberType extends Type {
  constructor() {
    super(types.typeName(1));
  }

  transform(value) {
    if (!this.matchType(value)) {
      return Number(value);
    }
  
    return value;
  }
}

class ArrayType extends Type {
  constructor() {
    super(types.typeName([]));
  }

  transform(value) {
    if (!this.matchType(value)) {
      return [].contact(value);
    }
  
    return value;
  }

  withItem(item) {
    this.item = item;
    return this;
  }
}

class StringType extends Type {
  constructor() {
    super(types.typeName(""));
  }

  transform(value) {
    if (!this.matchType(value)) {
      return value === null || value === undefined ? value : value.toString();
    }
  
    return value;
  }
}

class AnyType extends Type {
  constructor() {
    super("*");
  }

  matchType() {
    return true;
  }
}

Object.defineProperties(Type, {
  "Boolean": {
    get: () => new BooleanType()
  },
  "Number": {
    get: () => new NumberType()
  },
  "Array": {
    get: () => new ArrayType()
  },
  "String": {
    get: () => new StringType()
  },
  "Any": {
    get: () => new AnyType()
  }
});


function coerceValues(value, valueType) {
  if (!valueType) {
    return value;
  }

  var result;

  if (Type.check.isPlainObject(value)) {
    result = {};
    Object
      .keys(value)
      .forEach(key => result[key] = valueType[key] ? coerceValues(value[key], valueType[key]) : value[key]);
  }
  else if (Type.check.isArray(value) && valueType.item) {
    result = value.map(v => coerceValues(v, valueType.item));
  }
  else {
    result = value;
  }

  return valueType instanceof Type ? valueType.transform(result) : result;
}

module.exports = Type;
module.exports.check = types;
module.exports.coerceValues = coerceValues;
