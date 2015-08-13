import Ember from 'ember';

const {
  computed,
  defineProperty,
  Service
  } = Ember;

const SERVICE_IDENTIFIER = 'sync_service:';

export default Service.extend({

  storage: inject.service('storage'),

  sync(key, initialValue) {

    let data = this.get('data');

    defineProperty(data, key, computed({
      get(key) {
        return this.get('storage').find(SERVICE_IDENTIFIER + key);
      },
      set(key, value) {
        return this.get('storage').save(SERVICE_IDENTIFIER + key, value);
      }
    }));

    if (initialValue) {
      this.set('data.' + key, initialValue);
    }
    return this.get('data.' + key);
  },

  data: null,

  _handler(e) {
    if (e.key.indexOf(SERVICE_IDENTIFIER) === 0) {
      let key = e.key.substr(13);
      this.notifyPropertyChange('data.' + key);
    }
  },

  willDestroy() {
    this._super();
    window.removeEventListener('storage', this.get('_handler'), false);
  },

  init() {
    this._super();
    this.set('_sync', {});

    let handler = this.get('_handler').bind(this);
    this.set('_handler', handler);
    window.addEventListener('storage', handler, false);
  }

});
