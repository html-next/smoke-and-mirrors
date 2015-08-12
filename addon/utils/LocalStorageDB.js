import Ember from "ember";

var LS = window.localStorage,

  REGISTER_KEY = 'lsdb_persist_registry',

  ALLOWED_TYPES = [
    'Number',
    'Boolean',
    'String',
    'Object',
    'Array'
  ],

  getRealType = function (val) {
    var typeString = Object.prototype.toString.call(val);
    return typeString.substring(8, typeString.length - 1);
  };


export default Ember.Object.create({

  /**
   * @method save
   * @param key
   * @param {Object|Array|String} value
   *
   * maps to `window.localStorage.setItem` but is also type aware
   * will throw an error if the type is not Object, Array, Numbe, Boolean, Null, Undefined or String
   *
   * Saving a value that is Null or Undefined will result in the key being removed instead
   */
  save: function (key, value) {

    var type = getRealType(value);

    if (ALLOWED_TYPES.indexOf(type) !== -1) {
      return LS.setItem(key, JSON.stringify({
        type : type,
        value : value
      }));
    }
    if (type === 'Undefined' || type === 'Null') {
      this.remove(key);
      return null;
    }
    throw "Attempted to set key " + key + " with an invalid value of type " + type;
  },

  saveWithIndeces: function (key, value, namespace, indeces) {

    //save the data
    var status = this.save(key, value);

    //create indeces
    var i, index, indexStatus;
    for (i = 0; i < indeces.length; i++) {
      index = 'LSIndex:' + namespace + '::' + indeces[i] + '::' + value[indeces[i]];
      indexStatus = LS.setItem(index, key);
      status = !indexStatus ? false : status;
    }

    return status;
  },

  findIndex(namespace, key, value) {
    var index = 'LSIndex:' + namespace + '::' + key + '::' + value;
    var contentKey = LS.getItem(index);
    return contentKey ? this.find(contentKey) : null;
  },

  /**
   * @method find
   * @param key
   * @returns {*}
   *
   * maps to `window.localStorage.getItem
   */
  find: function (key) {
    var data = LS.getItem(key);
    try {
      data = JSON.parse(data);
      return data.value;
    } catch (e) {
      this.remove(key);
      return null;
    }
  },

  /**
   * @method find
   * @param key
   * @returns {*}
   *
   * maps to `window.localStorage.getItem
   */
  remove: function (key) {
    return LS.removeItem(key);
  },

  /**
   * @method persist
   * @param key
   * @param value
   *
   * saves a key:value pair to local storage and adds the key to a
   * register of keys that get persisted between calls to `clear`
   */
  persist: function (key, value) {

    var register = this.find(REGISTER_KEY) || [];
    register.push(key);
    this.save(REGISTER_KEY, register);

    return this.save(key, value);
  },

  /**
   * @method removePersistentKey
   * @param key
   */
  removePersistentKey: function (key) {
    var register = this.find(REGISTER_KEY) || [],
      index = register.indexOf(key);
    if (index !== -1) {
      register.splice(index, 1);
    }
    return this.save(REGISTER_KEY, register);
  },

  /**
   * @method clear
   *
   * Removes all values from localStorage not saved to localStorage via `persist`
   */
  clear: function () {
    var store = this,
      register = this.find(REGISTER_KEY) || [],
      data = register.map(function(key) {
      return { key : key, value : store.find(key) };
    });

    LS.clear();

    data.forEach(function (item) {
      store.save(item.key, item.value);
    });

    return store.save(REGISTER_KEY, register);

  },

  wipe: function() {
    LS.clear();
  }

});
