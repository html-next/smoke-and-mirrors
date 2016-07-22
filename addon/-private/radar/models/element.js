import FastArray from 'perf-primitives/fast-array';

const ELEMENT_POOL = new FastArray(200, 'Element Pool');
const STYLE_POOL = new FastArray(200, 'Style Pool');
const RECT_POOL = new FastArray(200, 'Rect Pool');

export const LayoutProps = [
  'position',
  'box-sizing',
  'float',
  'display',

  'height',
  'width',
  'minHeight',
  'minWidth',
  'maxHeight',
  'maxWidth',

  'borderTopWidth',
  'borderBottomWidth',
  'borderLeftWidth',
  'borderRightWidth',

  'marginTop',
  'marginBottom',
  'marginLeft',
  'marginRight',

  'paddingTop',
  'paddingBottom',
  'paddingLeft',
  'paddingRight'
];

export class Style {
  constructor(values) {
    this.init(values);
  }

  init(values = {}) {
    for (let i = 0; i < LayoutProps.length; i++) {
      this[LayoutProps[i]] = values[LayoutProps[i]];
    }
  }

  static create(values) {
    let po = STYLE_POOL.pop();

    if (po) {
      po.init(values);
      return po;
    }

    return new Style(values);
  }

  destroy() {
    for (let i = 0; i < LayoutProps.length; i++) {
      this[LayoutProps[i]] = undefined;
    }

    STYLE_POOL.push(this);
  }
}

const RECT_PROPS = [
  'top',
  'left',
  'bottom',
  'right',
  'width',
  'height'
];

export class Rect {
  constructor(values) {
    this.init(values);
  }

  init(values = {}) {
    for (let i = 0; i < RECT_PROPS.length; i++) {
      this[RECT_PROPS[i]] = values[RECT_PROPS[i]];
    }
  }

  static create(values) {
    let po = RECT_POOL.pop();

    if (po) {
      po.init(values);
      return po;
    }

    return new Rect(values);
  }

  destroy() {
    for (let i = 0; i < RECT_PROPS.length; i++) {
      this[RECT_PROPS[i]] = undefined;
    }

    RECT_POOL.push(this);
  }
}

function makeRect(styles) {
  let s = Rect.create();

  s.left = styles.left || 0;
  s.top = styles.top || 0;
  s.width = styles.width || 0;
  s.height = styles.height || 0;
  s.right = styles.left + styles.width;
  s.bottom = styles.top + styles.height;

  return s;
}

export default class VirtualElement {
  constructor(styles, element) {
    this.init(styles, element);
  }

  init(styles = {}, element = undefined) {
    this.element = element;
    this.style = Style.create(styles);
    this.rect = makeRect(styles);
  }

  getComputedStyle() {
    if (this.element) {
      this.style = new Style(this.element.getComputedStyle());
    }

    // return a copy
    return new Style(this.style);
  }

  getBoundingClientRect() {
    if (this.element) {
      this.rect = new Rect(this.element.getBoundingClientRect());
    }

    return new Rect(this.rect);
  }

  static create(styles, element) {
    let po = ELEMENT_POOL.pop();

    if (po) {
      po.init(styles, element);
      return po;
    }

    return new VirtualElement(styles, element);
  }

  destroy() {
    this.element = undefined;
    this.style = undefined;
    this.rect = undefined;

    ELEMENT_POOL.push(this);
  }

}
