
export default class Geography {

  constructor(element, state) {
    this.element = element;

    this.setState(state);
  }

  setState(state) {
    state = state || this.computeState();

    // copying over ensures we preserve shape from outside sources
    // and enables write ops as ClientRect can't be written
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

  computeState() {
    return this.element.getBoundingClientRect();
  }

  destroy() {
    this.element = undefined;
  }

  /*
   * Eventually, Satellite will be reusable and able to orbit many planets
   * so instead of these properties being on the satellite, they are available
   * as a method call based on planet.
   *
   * @param {Geography} planet
   * @returns {{rect: *, zoneX: number, zoneY: number, distanceX: *, distanceY: *, _satellite: Geography}}
   */
  getZones(planet) {
    let distanceY;
    let distanceX;

    // the bottom is above the viewport
    if (this.bottom < planet.top) {
      distanceY = planet.top - this.bottom;

      // the top is below the viewport
    } else if (this.top > planet.bottom) {
      distanceY = planet.bottom - this.top;

      // some portion is within the viewport
    } else {
      distanceY = 0;
    }

    // the right edge is to the left of the viewport
    if (this.right < planet.left) {
      distanceX = planet.left - this.right;

      // the left edge is to the right of the viewport
    } else if (this.left > planet.right) {
      distanceX = planet.right - this.left;

      // some portion is within the viewport
    } else { // we're within the planet
      distanceX = 0;
    }

    const zoneY = distanceY < 0 ? Math.floor(distanceY / planet.height) : Math.ceil(distanceY / planet.height);
    const zoneX = distanceX < 0 ? Math.floor(distanceX / planet.width) : Math.ceil(distanceX / planet.width);

    return {
      zoneX,
      zoneY,
      distanceX,
      distanceY
    };
  }

}
