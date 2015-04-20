import Ember from "ember";

var __bind = function (fn, me) { return function () { return fn.apply(me, arguments); }; };

export default Ember.Component.extend({

  tagName : 'carousel-component',
    layoutName : 'components/carousel-component',
    classNames: ['carousel', 'slide'],
    classNameBindings: ['sliding'],

    /**
     * The currently active slide index.
     * This number is two way bound, meaning that changes to the property bound to it
     * will change the state of the carousel.  Changes to the state of the carousel
     * will change the property this is bound to.
     *
     * @attribute {Number} activeIndex
     * @default 0
     */
    activeIndex: 0,

    /**
     * This ensures we update the carousel position if the user hits the back button
     *  or manually changes the url
     *
     * @method _activeIndexObserver
     * @private
     */
    _activeIndexObserver : function () {
        if (!this.get('sliding')) {
            var newIndex = this.get('activeIndex'),
                curIndex = this.$('.item').index(this.$('.active'));
            if (newIndex !== curIndex) {
                this.set('activeIndex', curIndex);
                this.to(newIndex);
            }
        }

    }.observes('activeIndex'),

    setupInitialContent : function () {

        //If no content array was provides, we build it from what was in {{yield}}
        if (!this.get('content')) {
            this.set('content', new Array(this.$('.item').length));
        }

        //transition to the slide that should be active
        this.to(this.get('activeIndex'), true);
        return true;
    }.on('didInsertElement'),

  _validateContinue : null,

    actions: {

      nextCarouselSlide : function (context) {

        var self = this, activeIndex, contentLength, nextIndex;
        if (this.get('sliding')) {
          return;
        }
        if (this.get('_validateContinue')) {
          return this._validateContinue(context).then(function (result) {
            if (!result) {
              return false;
            }
            activeIndex = self.get('activeIndex');
            contentLength = self.get('content.length');
            nextIndex = activeIndex + 1;
            nextIndex = nextIndex >= contentLength ? 0 : nextIndex;
            return self.slide('next', nextIndex);
          });
        } else {
          activeIndex = this.get('activeIndex');
          contentLength = this.get('content.length');
          nextIndex = activeIndex + 1;
          nextIndex = nextIndex >= contentLength ? 0 : nextIndex;
          return this.slide('next', nextIndex);
        }

      },

      previousCarouselSlide : function () {
        var activeIndex, contentLength, nextIndex;
        if (this.get('sliding')) {
            return;
        }
        activeIndex = this.get('activeIndex');
        contentLength = this.get('content.length');
        nextIndex = activeIndex - 1;
        nextIndex = nextIndex < 0 ? contentLength - 1 : nextIndex;
        return this.slide('prev', nextIndex);
      }

    },

    to: function (pos, init) {
        var direction;
        if (init) {
            this.set('activeIndex', 0);
        }
        if ( !init && !(0 <= pos && pos < this.get('content.length'))) {
            return;
        }
        if (this.get('sliding')) {
            return this.$().one('slid', __bind(function() {
                return this.to(pos);
            }, this));
        }
        direction = pos > this.get('activeIndex') ? 'next' : 'prev';
        return this.slide(direction, pos);
    },

    slide: function (type, nextIndex) {
        var $active, $next, direction;
        if (this.get('activeIndex') === nextIndex) {
            return;
        }
        direction = type === 'next' ? 'left' : 'right';
        $active = Ember.$(this.$('.item').get(this.get('activeIndex')));
        $next = Ember.$(this.$('.item').get(nextIndex));
        this.set('sliding', true);
        $next.addClass(type);

        //TODO determine if this was a render hack
        //$next[0].offsetWidth;

        $active.addClass(direction);
        $next.addClass(direction);
        if (Ember.$.support.transition) {
            return this.$().one(Ember.$.support.transition.end, __bind(function() {
                return Ember.run(this, function () {
                    this.set('activeIndex', nextIndex);
                    $next.removeClass([type, direction].join(' ')).addClass('active');
                    $active.removeClass(['active', direction].join(' '));
                    return this.set('sliding', false);
                });
            }, this));
        } else {
            return Ember.run(this, function() {
                this.set('activeIndex', nextIndex);
                $next.removeClass([type, direction].join(' ')).addClass('active');
                $active.removeClass(['active', direction].join(' '));
                return this.set('sliding', false);
            });
        }

    },

    //hammerFilter : '.carousel, .carousel-inner, .item, .row, .container-fluid, .col-xs-12',
    gestureExclude : 'input, button, .btn',

    tap : function () {
      if (this.get('close')) {
        this.sendAction('close');
      }
    },

    press : function () {
      if (this.get('close')) {
        this.sendAction('close');
      }
    },

    swipeLeft : function () {
      if (!this.get('sliding')) {
        var nextIndex = this.get('activeIndex') + 1;
        this.to(nextIndex >= this.get('content.length') ? 0 : nextIndex);
      }
    },
    swipeRight : function () {
      if (!this.get('sliding')) {
        var nextIndex = this.get('activeIndex') - 1;
        this.to(nextIndex < 0 ? this.get('content.length') - 1 : nextIndex);
      }
    }

});
