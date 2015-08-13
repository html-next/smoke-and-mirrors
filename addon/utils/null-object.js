/*global Object*/
function NullObject() { }

NullObject.prototype = Object.create(null, {
  constructor: {
    value: undefined,
    enumerable: false,
    writable: true
  }
});

export default NullObject;
