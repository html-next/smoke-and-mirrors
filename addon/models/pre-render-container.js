import Ember from 'ember';

const {
  run
  } = Ember;

export default class PreRenderContainer {

  constructor(parentElement, component) {
    this.parentElement = parentElement;
    this.parent = component.element;
    this.render = false;
    this.component = component;
    this._styles = {};
    this.styles = null;
    this.inFragment = false;
    this._lastNode = null;
    this._firstNode = null;
  }

  setState(state) {
    this.component = state.component || this.component;
    this.parent = state.parent || this.parent;
    this.parentElement = state.parentElement || this.parentElement;
    this._lastNode = state._lastNode || this._lastNode;
    this._firstNode = state._firstNode || this._firstNode;

    this.setupFragment();

    if (state.hasOwnProperty('styles')) {
      this.setupStyle(state.styles);
    } else {
      this.setupStyle(this.styles);
    }
  }

  toggle() { this.render = !this.render; this.moveRenderedContent(); }
  show() { this.render = true; this.moveRenderedContent(); }
  hide() { this.render = false; this.moveRenderedContent(); }

  updateDestination(parent) {
    if (parent) {
      this.parent = parent;
    }
    this.moveRenderedContent();
    if (this.component.didMoveElement) {
      this.component.didMoveElement();
    }
  }

  moveRenderedContent() {
    const destination = this.render ? this.parent : this._fragment;
    PreRenderContainer.appendToDestination(destination, this._firstNode, this._lastNode);
  }

  getComputedDimensions() {
    this.dimensions = PreRenderContainer.getDimensions(this._fragment);
    if (this.component.didPreRender) {
      this.component.didPreRender(this.dimensions);
    }
  }

  _updateFragmentStyles() {
    const parent = this.parent;
    const parentWrapper = parent.parentNode;
    const computedStyle = PreRenderContainer.getDimensions(parentWrapper);
    PreRenderContainer.applyDimensions(this._fragmentWrapper, computedStyle);

    this.getComputedDimensions();
  }

  setupFragment() {
    let content;
    if (this._fragment) {
      if (this.inFragment) {
        content = this._fragment.parentNode.removeChild(this._fragment);
      }
    }

    this._fragment = this.parent.cloneNode(false);
    this.parentElement.appendChild(this._fragment);
    if (content) {
      PreRenderContainer.appendToDestination(this._fragment, this._firstNode, this._lastNode);
      content = null;
    }
  }

  setupStyle(styles) {
    this.styles = styles;

    // add
    Object.keys(this.styles).forEach((key) => {
      let val = this.styles[key];
      if (val !== this._styles[key]) {
        this._styles[key] = val;
        this._fragment.style[key] = val;
      }
    });
    // remove
    Object.keys(this._styles).forEach((key) => {
      let val = this._styles[key];
      if (val && !this.styles.hasOwnProperty(key)) {
        this._styles[key] = null;
        this._fragment.style[key] = '';
      }
    });
  }

  static appendToDestination(destinationElement, firstNode, lastNode) {
    let currentActiveElement = document.activeElement;

    PreRenderContainer.appendRange(destinationElement, firstNode, lastNode);
    if (document.activeElement !== currentActiveElement) {
      currentActiveElement.focus();
    }
  }

  static appendRange(destinationElement, firstNode, lastNode) {
    while(firstNode) {
      destinationElement.insertBefore(firstNode, null);
      firstNode = firstNode !== lastNode ? lastNode.parentNode.firstChild : null;
    }
  }

  static removeRange(firstNode, lastNode) {
    var node = lastNode;
    do {
      var next = node.previousSibling;
      if (node.parentNode) {
        node.parentNode.removeChild(node);
        if (node === firstNode) {
          break;
        }
      }
      node = next;
    } while (node);
  }

  destroy() {
    this.component = null;
    this._fragment.parentNode.removeChild(this._fragment);
    this.parentElement = null;
    this._fragment = null;
    this._lastNode = null;
    this._firstNode = null;
    this._styles = null;
    this.styles = null;
  }


  static dimFromStr(str) {
    return str ? parseFloat(str) : 0;
  }

  static getWidth(dims, withMargins) {
    let width;
    switch (dims.boxSizing) {
      case 'border-box':
        width = dims.width +
          dims.borderLeftWidth + dims.borderRightWidth +
          dims.paddingLeft + dims.paddingRight;
        break;
      case 'content-box':
        width = dims.width;
        break;
      default:
        width = dims.width;
        break;
    }
    if (withMargins) {
      width += dims.marginLeft + dims.marginRight;
    }
    return width;
  }

  static getHeight(dims, withMargins) {
    let height;
    switch (dims.boxSizing) {
      case 'border-box':
        height = dims.height +
          dims.borderTopWidth + dims.borderBottomWidth +
          dims.paddingTop + dims.paddingBottom;
        break;
      case 'content-box':
        height = dims.height;
        break;
      default:
        height = dims.height;
        break;
    }
    if (withMargins) {
      height += dims.marginTop + dims.marginBottom;
    }
    return height;
  }

  static getDimensions(element) {
    let style = window.getComputedStyle(element, null);
    let dims = {
      width: PreRenderContainer.dimFromStr(style.width),
      height: PreRenderContainer.dimFromStr(style.height),
      marginLeft: PreRenderContainer.dimFromStr(style.marginLeft),
      marginRight: PreRenderContainer.dimFromStr(style.marginRight),
      marginTop: PreRenderContainer.dimFromStr(style.marginTop),
      marginBottom: PreRenderContainer.dimFromStr(style.marginBottom),
      paddingLeft: PreRenderContainer.dimFromStr(style.paddingLeft),
      paddingRight: PreRenderContainer.dimFromStr(style.paddingRight),
      paddingTop: PreRenderContainer.dimFromStr(style.paddingTop),
      paddingBottom: PreRenderContainer.dimFromStr(style.paddingBottom),
      borderLeftWidth: PreRenderContainer.dimFromStr(style.borderLeftWidth),
      borderRightWidth: PreRenderContainer.dimFromStr(style.borderRightWidth),
      borderTopWidth: PreRenderContainer.dimFromStr(style.borderTopWidth),
      borderBottomWidth: PreRenderContainer.dimFromStr(style.borderBottomWidth),
      boxSizing: style.boxSizing,
      fontSize: PreRenderContainer.dimFromStr(style.fontSize),
      lineHeight: PreRenderContainer.dimFromStr(style.lineHeight)
    };
    return {
      style: dims,
      calc: {
        width: PreRenderContainer.getWidth(dims),
        height: PreRenderContainer.getHeight(dims),
        widthWithMargin: PreRenderContainer.getWidth(dims, true),
        heightWithMargin: PreRenderContainer.getHeight(dims, true)
      }
    };
  }

  static applyDimensions(element, dimensions) {
    for (let i in dimensions.style) {
      if (dimensions.style.hasOwnProperty(i)) {
        element.style[i] = i === 'boxSizing' ? dimensions.style[i] : dimensions.style[i] + 'px';
      }
    }
  }

}
