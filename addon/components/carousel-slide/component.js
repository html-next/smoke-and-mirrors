import Ember from "ember";

export default Ember.Component.extend({

  tagName : 'carousel-slide',

  classNames: ['item'],
  title: '',
  back: true,
  layoutName: 'components/carousel-slide',
  carouselParent : null,

  actions : {
    nextCarouselSlide : function (event) {
      var parent = this.get('carouselParent') || this;
      parent.send('nextCarouselSlide', event);
    },
    prevCarouselSlide : function (event) {
      parent.send('prevCarouselSlide', event);
    }
  }

});
