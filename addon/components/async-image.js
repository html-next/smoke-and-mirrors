import Ember from 'ember';
import layout from '../templates/components/async-image';

const {
  Component,
  computed,
  observer,
  run
  } = Ember;

export default Component.extend({

  layout: layout,
  tagName: 'async-image',

  classNames: ['async-image'],
  classNameBindings: ['imgState'],

  src: '',
  _src: '',

  imgState: computed('isLoaded', 'isLoading', 'isFailed', 'isEmpty', function () {
    if (this.get('isFailed')) { return 'is-failed'; }
    if (this.get('isLoaded')) { return 'is-loaded'; }
    if (this.get('isLoading')) { return 'is-loading'; }
    if (this.get('isEmpty')) { return 'is-empty'; }
    return 'unknown';
  }),

  isLoaded: false,
  isLoading: false,
  isFailed: false,
  isEmpty: true,

  _image: null,

  willDestroy() {
    let loaded = this._loaded;
    let Img = this._image;
    Img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

    if (Img.attachEvent) {
      Img.detachEvent('onload', loaded);
    } else {
      Img.removeEventListener('load', loaded);
    }

    this._image = null;
  },

  _onload(Image) {
    if (!(this.get('isDestroyed') || this.get('isDestroying'))) {
      this.set('_src', Image.src);
      this.set('isLoaded', true);
    }
  },

  _loadImage: observer('src', function() {

    // reset if component's image has been changed
    this.setProperties({
      isAppending: false,
      isLoaded: false,
      isLoading: false,
      isFailed: false,
      isEmpty: true
    });

    let src = this.get('src');
    let Img;

    let loaded = () => {
      run.scheduleOnce('actions', this, this._onload, Img);
    };
    this._loaded = loaded;

    if (src) {
      this.set('isLoading', true);

      Img = new Image();
      this._image = Img;

      if (Img.attachEvent) {
        Img.attachEvent('onload', loaded);
      } else {
        Img.addEventListener('load', loaded);
      }
      Img.src = src;

      // image is cached
      if (Img.complete || Img.readyState === 4) {
        loaded();
      }

    }
  }),

  init() {
    this._super();
    this._loadImage();
  }

});
