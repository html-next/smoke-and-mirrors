import Ember from "ember";

export default Ember.Component.extend({

  tagName : 'async-image',

  classNames : ['async-image'],
  classNameBindings : ['imgState'],

  src : '',

  imgState : function () {
    if (this.get('isFailed')) { return 'is-failed'; }
    if (this.get('isLoaded')) { return 'is-loaded'; }
    if (this.get('isAppending')) { return 'is-appending'; }
    if (this.get('isLoading')) { return 'is-loading'; }
    if (this.get('isEmpty')) { return 'is-empty'; }
    return 'unknown';
  }.property('isLoaded', 'isLoading', 'isFailed', 'isEmpty', 'isAppending'),

  isAppending : false,
  isLoaded : false,
  isLoading : false,
  isFailed : false,
  isEmpty : true,

  _onInsert: Ember.on('didInsertElement', function() {
    if (this.get('isLoaded')) {
      var $image = Ember.$('<img src="' + Image.src + '">');
      this.$().html($image);
    }
  }),

  _onload : function (Image) {
    this.set('isAppending', true);
    var self = this;
    var $view = this.$();
    var $image = Ember.$('<img src="' + Image.src + '">');
    $image.on('load', function () {
      $view.html($image);
      self.set('isLoaded', true);
    });
  },

  _loadImage : function () {

    var src = this.get('src');
    var Img;

    //debounce the load callback to ensure it only fires once
    var loaded = function loaded() {
      Ember.run.debounce(this, this._onload, Img, 10);
    }.bind(this);

    if (src) {

      this.set('isLoading', true);

      Img = new Image();

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
  }.observes('src').on('init')

});
