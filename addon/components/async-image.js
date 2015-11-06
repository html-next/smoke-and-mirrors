import Ember from 'ember';

const {
  Component,
  computed,
  observer
  } = Ember;

const TRANSPARENT_IMAGE = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

export default Component.extend({
  tagName: 'img',

  // attributes
  title: null,
  alt: null,
  src: null,
  width: null,
  height: null,

  // image
  _src: null,
  _image: null,

  attributeBindings: ['_src:src', 'title', 'alt', 'width', 'height'],
  classNames: ['async-image'],
  classNameBindings: ['imgState'],

  // state
  isLoaded: false,
  isLoading: false,
  isFailed: false,
  isEmpty: true,
  imgState: computed('isLoaded', 'isLoading', 'isFailed', 'isEmpty', function () {
    if (this.get('isFailed')) { return 'is-failed'; }
    if (this.get('isLoading')) { return 'is-loading'; }
    if (this.get('isLoaded')) { return 'is-loaded'; }
    if (this.get('isEmpty')) { return 'is-empty'; }
    return 'unknown';
  }),

  _imageLoadHandler: null,
  _imageErrorHandler: null,
  willDestroy() {
    this._super();
    this.teardownImage();
  },

  teardownImage() {
    if (this._image) {
      this.teardownHandlers(this._image);
      this.set('_src', TRANSPARENT_IMAGE);
      this._image.src = TRANSPARENT_IMAGE;
      this._image = null;
    }
  },

  teardownHandlers(image) {
    if (image.attachEvent) {
      image.detachEvent('onload', this._imageLoadHandler);
      image.detachEvent('onerror', this._imageErrorHandler);
    } else {
      image.removeEventListener('load', this._imageLoadHandler, true);
      image.removeEventListener('error', this._imageErrorHandler, true);
    }
    this._imageLoadHandler = null;
    this._imageErrorHandler = null;
  },

  _onload(Image) {
    if (!(this.get('isDestroyed') || this.get('isDestroying'))) {
      this.set('_src', Image.src);
      this.set('isLoaded', true);
      this.set('isLoading', false);
      this.set('isFailed', false);
    }
  },

  _onError(/*Image*/) {
    this.set('isFailed', true);
    this.teardownImage();
  },

  _loadImage: observer('src', function() {
    if (this._image) {
      this.teardownHandlers(this._image);
    }

    this.setProperties({
      isAppending: false,
      isEmpty: true
    });

    let src = this.get('src');

    if (src) {
      this.set('isLoading', true);

      let Img = new Image();
      let loaded = () => {
        this._onload(Img);
      };
      let failed = () => {
        this._onError(Img);
      };
      this._imageLoadHandler = loaded;
      this._imageErrorHandler = failed;
      this._image = Img;

      if (Img.attachEvent) {
        Img.attachEvent('onload', loaded);
        Img.attachEvent('onerror', failed);
      } else {
        Img.addEventListener('load', loaded, true);
        Img.addEventListener('error', failed, true);
      }
      Img.src = src;

      // image is cached
      if (Img.complete || Img.readyState === 4) {
        loaded();
      }

    } else {
      this.teardownImage();
    }
  }),

  init() {
    this._super();
    this._loadImage();
  }

});
