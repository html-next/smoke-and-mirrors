/* global JSON*/
import Ember from 'ember';

const {
  Service
  } = Ember;

const LS = window.localStorage;
const REGISTER_KEY = 'lsdb_persist_registry';
const ALLOWED_TYPES = [
    'Number',
    'Boolean',
    'String',
    'Object',
    'Array'
  ];

function getTypeForVar(val) {
  let typeString = Object.prototype.toString.call(val);
  return typeString.substring(8, typeString.length - 1);
}

export default Service.extend({


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
  save(key, value) {
    let type = getTypeForVar(value);

    if (ALLOWED_TYPES.indexOf(type) !== -1) {
      return LS.setItem(key, JSON.stringify(value));
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
  find(key) {
    let data = LS.getItem(key);

    try {
      data = JSON.parse(data);
      return data;
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
  remove(key) {
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
  persist(key, value) {
    let register = this.find(REGISTER_KEY) || [];

    register.push(key);
    this.save(REGISTER_KEY, register);
    return this.save(key, value);
  },


  /**
   * @method removePersistentKey
   * @param key
   */
  removePersistentKey(key) {
    let register = this.find(REGISTER_KEY) || [];
    let index = register.indexOf(key);

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
  clear() {
    let register = this.find(REGISTER_KEY) || [];
    let data = register.map((key) => {
      return { key: key, value: this.find(key) };
    });

    this.wipe();

    data.forEach((item) => {
      this.save(item.key, item.value);
    });

    return this.save(REGISTER_KEY, register);
  },


  wipe: LS.clear

});
