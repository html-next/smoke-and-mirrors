/*
 * There are significant differences between browsers
 * in how they implement "scroll" on document.body
 *
 * The only cross-browser listener for scroll on body
 * is to listen on window with capture.
 *
 * They also implement different standards for how to
 * access the scroll position.
 *
 * This singleton class provides a cross-browser way
 * to access and set the scrollTop and scrollLeft properties.
 *
 */
export function Container() {

  Object.defineProperty(this, 'scrollTop', {
    get() {
      return window.scrollY ||
        window.pageYOffset ||
        document.body.scrollTop ||
        document.documentElement.scrollTop;
    },
    set(v) {
      return window.scrollY =
        window.pageYOffset =
          document.body.scrollTop =
            document.documentElement.scrollTop = v;
    }
  });

  Object.defineProperty(this, 'scrollLeft', {
    get() {
      return window.scrollX ||
        window.pageXOffset ||
        document.body.scrollLeft ||
        document.documentElement.scrollLeft;
    },
    set(v) {
      return window.scrollX =
        window.pageXOffset =
          document.body.scrollLeft =
            document.documentElement.scrollLeft = v;
    }
  });

}

Container.prototype.addEventListener = function addEventListener(event, handler, options) {
  return window.addEventListener(event, handler, options);
};

Container.prototype.removeEventListener = function addEventListener(event, handler, options) {
  return window.removeEventListener(event, handler, options);
};

Container.prototype.getBoundingClientRect = function getBoundingClientRect() {
  return {
    height: window.innerHeight,
    width: window.innerWidth,
    top: 0,
    left: 0,
    right: window.innerWidth,
    bottom: window.innerHeight
  };
};

export default new Container();
