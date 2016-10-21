import Geography from 'smoke-and-mirrors/-private/radar/models/geography';

export default class Proxy {
  constructor(key, ref, height = 0, top = 0) {
    this.key = key;
    this.ref = ref;
    this.inserted = false;
    this._dirtied = 0;
    this.index = 0;
    this.geography = new Geography(null, { height, top });
  }

  get height() {
    return this.geography.height;
  }
}
