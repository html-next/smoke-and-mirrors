import Ember from 'ember';

const {
  Component,
  computed,
  observer,
  run
  } = Ember;

const TRANSPARENT_IMAGE = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

export default Component.extend({
  tagName: 'img',

  // attributes
  title: null,
  alt: null,
  src: null,

  // image
  _src: null,
  _image: null,

  attributeBindings: ['_src:src', 'title', 'alt'],
  classNames: ['async-image'],
  classNameBindings: ['imgState'],

  // state
  isLoaded: false,
  isLoading: false,
  isFailed: false,
  isEmpty: true,
  imgState: computed('isLoaded', 'isLoading', 'isFailed', 'isEmpty', function () {
    if (this.get('isFailed')) { return 'is-failed'; }
    if (this.get('isLoaded')) { return 'is-loaded'; }
    if (this.get('isLoading')) { return 'is-loading'; }
    if (this.get('isEmpty')) { return 'is-empty'; }
    return 'unknown';
  }),

  _imageLoadHandler: null,
  willDestroy() {
    let loaded = this._imageLoadHandler;
    let Img = this._image;
    Img.src = TRANSPARENT_IMAGE;

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
    if (this.get('_src')) {
      this.set('_src', TRANSPARENT_IMAGE);
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
        run.scheduleOnce('sync', this, this._onload, Img);
      };
      this._imageLoadHandler = loaded;
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
