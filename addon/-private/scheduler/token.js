export default class Token {
  constructor(parent) {
    this._parent = parent;
    this._cancelled = false;
  }

  get cancelled() {
    return this._cancelled || (this._parent ? this._parent.cancelled : false);
  }

  set cancelled(v) {
    this._cancelled = v;
  }
}
