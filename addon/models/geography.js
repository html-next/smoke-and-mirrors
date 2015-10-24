function getRect(element) {
  if (element === window) {
    return {
      height: window.innerHeight,
      width: window.innerWidth,
      top: 0,
      left: 0,
      right: window.innerWidth,
      bottom: window.innerHeight
    };
  } else {
    return element.getBoundingClientRect();
  }

}

export default class Geography {

  constructor(element, state) {
    this.element = element;
    this.setState(state);
  }

  setState(state) {
    state = state || getRect(this.element);
    this.top = state.top || 0;
    this.bottom = state.bottom || 0;
    this.left = state.left || 0;
    this.right = state.right || 0;
    this.width = state.width || 0;
    this.height = state.height || 0;
  }

  getState() {
    return {
      top: this.top,
      bottom: this.bottom,
      left: this.left,
      right: this.right,
      width: this.width,
      height: this.height
    };
  }

  /**
   * Eventually, Satellite will be reusable and able to orbit many planets
   * so instead of these properties being on the satellite, they are available
   * as a method call based on planet.
   *
   * @param {Geography} planet
   * @returns {{rect: *, zoneX: number, zoneY: number, distanceX: *, distanceY: *, _satellite: Geography}}
   */
  getZones(planet) {
    let distanceX;
    let distanceY;

    if (this.bottom > planet.top) {
      distanceX = this.bottom - planet.top;
    } else if (this.top > planet.top) {
      distanceX = this.top - planet.top;
    } else if (this.top < planet.bottom) {
      distanceX = this.top - planet.bottom;
    } else if (this.bottom < planet.bottom) {
      distanceX = this.bottom - planet.bottom;
    } else { //we're within the planet
      distanceX = 0;
    }

    if (this.right > planet.left) {
      distanceY = this.right - planet.left;
    } else if (this.left > planet.left) {
      distanceY = this.left - planet.left;
    } else if (this.left < planet.right) {
      distanceY = this.left - planet.right;
    } else if (this.right < planet.right) {
      distanceY = this.right - planet.right;
    } else { //we're within the planet
      distanceY = 0;
    }

    let zoneX = Math.floor(distanceX / planet.height);
    let zoneY = Math.floor(distanceY / planet.width);

    return {
      zoneX: zoneX,
      zoneY: zoneY,
      distanceX: distanceX,
      distanceY: distanceY
    };
  }

}
