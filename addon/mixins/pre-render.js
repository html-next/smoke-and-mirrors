import Ember from 'ember';

const {
  Mixin,
  computed,
  observer,
  run
  } = Ember;


export default Mixin.create({

  renderInParent: false,
  parent: null, // parent element
  styles: null,

  destination: computed('renderInParent', 'parent', function() {
    let renderInParent = this.get('renderInParent');
    let parent = this.get('parent');
    this._sm_appendBody((parent || this.element).cloneNode(false));
    return renderInParent ? (parent || this.element) : this._fragmentBody;
  }),

  didPreRender(/*dimensions*/) {},
  didMoveElement() {},

  _sm_getComputedStyle() {
    let bodyStyle = getDimensions(this._fragmentBody);
    this.didPreRender(bodyStyle);
  },


  _sm_updateFragmentStyles() {
    let parent = this.get('parent') || this.element;
    if (parent === this.element) {
      if (!this.get('parentElementDidInsert')) {
        return;
      }
    }

    let parentWrapper = parent.parentNode;
    let computedStyle = getDimensions(parentWrapper);
    applyDimensions(this._fragmentWrapper, computedStyle);

    this._sm_getComputedStyle();
  },

  _fragment: null,
  _fragmentWrapper: null,
  _fragmentBody: null,
  _sm_setupFragment() {
    if (this._fragment) {
      return;
    }
    let fragment = document.createElement('div');
    fragment.style.position = 'absolute';
    fragment.style.maxWidth = '9999px';
    fragment.style.top = '0px';
    fragment.style.left = '-10000px';
    fragment.style.opacity = 0;

    this._fragment = fragment;
    this._fragmentWrapper = document.createElement('div');
    fragment.appendChild(this._fragmentWrapper);
    document.body.appendChild(fragment);
  },

  _sm_appendBody(clone) {
    this._fragmentBody = clone;
    this._fragmentWrapper.appendChild(clone);
  },

  willInsertElement() {
    this._super(...arguments);
    this._firstNode = this.element.firstChild;
    this._lastNode = this.element.lastChild;
    this.appendToDestination();
  },

  didInsertElement() {
    this.set('parentElementDidInsert', true);
    if (!this.get('parent')) {
     this._sm_updateFragmentStyles();
    }
  },

  willDestroyElement() {
    this._super(...arguments);
    var firstNode = this._firstNode;
    var lastNode = this._lastNode;
    run.schedule('render', () => {
      this.removeRange(firstNode, lastNode);
    });
  },

  willDestroy() {
    this._super(...arguments);
    this._fragment = null;
    this._fragmentBody = null;
    this._fragmentWrapper = null;
  },

  destinationDidChange: observer('destination', function() {
    let destinationElement = this.get('destination');
    if (destinationElement !== this._firstNode.parentNode) {
      run.schedule('render', this, 'appendToDestination');
    }
  }),

  appendToDestination() {
    let destinationElement = this.get('destination');
    let currentActiveElement = document.activeElement;

    this.appendRange(destinationElement, this._firstNode, this._lastNode);
    if (document.activeElement !== currentActiveElement) {
      currentActiveElement.focus();
    }

    if (destinationElement === this._fragmentBody) {
      this._sm_updateFragmentStyles();
    }

    this.didMoveElement();
  },

  appendRange(destinationElement, firstNode, lastNode) {
    while(firstNode) {
      destinationElement.insertBefore(firstNode, null);
      firstNode = firstNode !== lastNode ? lastNode.parentNode.firstChild : null;
    }
  },

  removeRange(firstNode, lastNode) {
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
  },

  init() {
    this._super(...arguments);
    this._sm_setupFragment();
  }

});




function dimFromStr(str) {
  return str ? parseFloat(str) : 0;
}

function getWidth(dims, withMargins) {
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

function getHeight(dims, withMargins) {
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

function getDimensions(element) {
  let style = window.getComputedStyle(element, null);
  let dims = {
    width: dimFromStr(style.width),
    height: dimFromStr(style.height),
    marginLeft: dimFromStr(style.marginLeft),
    marginRight: dimFromStr(style.marginRight),
    marginTop: dimFromStr(style.marginTop),
    marginBottom: dimFromStr(style.marginBottom),
    paddingLeft: dimFromStr(style.paddingLeft),
    paddingRight: dimFromStr(style.paddingRight),
    paddingTop: dimFromStr(style.paddingTop),
    paddingBottom: dimFromStr(style.paddingBottom),
    borderLeftWidth: dimFromStr(style.borderLeftWidth),
    borderRightWidth: dimFromStr(style.borderRightWidth),
    borderTopWidth: dimFromStr(style.borderTopWidth),
    borderBottomWidth: dimFromStr(style.borderBottomWidth),
    boxSizing: style.boxSizing,
    fontSize: dimFromStr(style.fontSize),
    lineHeight: dimFromStr(style.lineHeight)
  };
  return {
    style: dims,
    calc: {
      width: getWidth(dims),
      height: getHeight(dims),
      widthWithMargin: getWidth(dims, true),
      heightWithMargin: getHeight(dims, true),
    }
  };
}

function applyDimensions(element, dimensions) {
  for (let i in dimensions.style) {
    if (dimensions.style.hasOwnProperty(i)) {
      element.style[i] = i === 'boxSizing' ? dimensions.style[i] : dimensions.style[i] + 'px';
    }
  }
}
