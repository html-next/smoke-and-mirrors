import Ember from 'ember';

const {
  copy
  } = Ember;

export default class VirtualElement {
  constructor(styles, element) {
    const s = this.style = {};
    this.element = element;

    styles = styles || {};

    s.position = styles.position || 'absolute';
    s.height = styles.height || 0;
    s.width = styles.width || 0;

    s.top = styles.top || 0;
    s.bottom = styles.bottom || 0;
    s.left = styles.left || 0;
    s.right = styles.right || 0;

    s.marginTop = styles.marginTop || styles.margin || 0;
    s.marginBottom = styles.marginBottom || styles.margin || 0;
    s.marginLeft = styles.marginLeft || styles.margin || 0;
    s.marginRight = styles.marginRight || styles.margin || 0;

    s.paddingTop = styles.paddingTop || styles.padding || 0;
    s.paddingBottom = styles.paddingBottom || styles.padding || 0;
    s.paddingLeft = styles.paddingLeft || styles.padding || 0;
    s.paddingRight = styles.paddingRight || styles.padding || 0;
  }

  getComputedStyle() {
    return this.element ? this.element.getComputedStyle() : copy(this.style);
  }

  getBoundingClientRect() {
    return this.element ? this.element.getBoundingClientRect() : {
      top: this.top,
      bottom: this.bottom,
      left: this.left,
      right: this.right,
      width: this.width,
      height: this.height
    };
  }

  destroy() {
    this.element = null;
    this.style = null;
  }

}
