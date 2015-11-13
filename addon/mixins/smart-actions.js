import Ember from 'ember';

const {
  Mixin,
  run
  } = Ember;


export default Mixin.create({

  canSendActions(/*name, context*/) {
    return true;
  },

  prepareActionContext(name, context) {
    return context;
  },

  _sm_actionCache: null,
  sendActionOnce(name, context) {
    if (!this.canSendActions(name, context)) {
      return;
    }

    context = this.prepareActionContext(name, context);
    if (!context) {
      return;
    }

    let contextCache = this._sm_actionCache;
    if (contextCache.hasOwnProperty(name)) {
      let contextKey = this.keyForContext(context);
      if (contextCache[name] === contextKey) {
        return;
      } else {
        contextCache[name] = contextKey;
      }
    }

    // this MUST be async or glimmer will freak
    run.schedule('afterRender', this, this.sendAction, name, context);
  },

  willDestroy() {
    this._super();
    let contextCache = this._sm_actionCache;
    this._sm_actionCache = null;
  }

});
