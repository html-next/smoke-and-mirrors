import Ember from 'ember';
import layout from './template';
import getDimensions from '../../utils/element/get-dimensions';
import applyDimensions from '../../utils/element/apply-dimensions';

const {
  computed,
  Component,
  observer,
  run
} = Ember;

export default Component.extend({
  layout,

  renderInParent: false,
  parent: null, // parent element
  destination: computed('renderInParent', 'parent', function() {
    const renderInParent = this.get('renderInParent');
    const parent = this.get('parent');

    this.__smAppendBody((parent || this.element).cloneNode(false));
    return renderInParent ? (parent || this.element) : this._fragmentBody;
  }),

  didPreRender(/* dimensions */) {},
  didMoveElement() {},

  __smGetComputedStyle() {
    const bodyStyle = getDimensions(this._fragmentBody);

    this.didPreRender(bodyStyle);
  },

  __smUpdateFragmentStyles() {
    const parent = this.get('parent') || this.element;

    if (parent === this.element) {
      if (!this.get('parentElementDidInsert')) {
        return;
      }
    }

    const parentWrapper = parent.parentNode;
    const computedStyle = getDimensions(parentWrapper);

    applyDimensions(this._fragmentWrapper, computedStyle);

    this.__smGetComputedStyle();
  },

  _fragment: null,
  _fragmentWrapper: null,
  _fragmentBody: null,
  __smSetupFragment() {
    if (this._fragment) {
      return;
    }
    const fragment = document.createElement('div');

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

  __smAppendBody(clone) {
    this._fragmentBody = clone;
    this._fragmentWrapper.appendChild(clone);
  },

  didInsertElement() {
    this._firstNode = this.element.firstChild;
    this._lastNode = this.element.lastChild;
    this.appendToDestination();
    this.set('parentElementDidInsert', true);
    if (!this.get('parent')) {
      this.__smUpdateFragmentStyles();
    }
  },

  willDestroyElement() {
    this._super(...arguments);
    const firstNode = this._firstNode;
    const lastNode = this._lastNode;

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
    const destinationElement = this.get('destination');

    if (destinationElement !== this._firstNode.parentNode) {
      run.schedule('render', this, 'appendToDestination');
    }
  }),

  appendToDestination() {
    const destinationElement = this.get('destination');
    const currentActiveElement = document.activeElement;

    this.appendRange(destinationElement, this._firstNode, this._lastNode);
    if (document.activeElement !== currentActiveElement) {
      currentActiveElement.focus();
    }

    if (destinationElement === this._fragmentBody) {
      this.__smUpdateFragmentStyles();
    }

    this.didMoveElement();
  },

  appendRange(destinationElement, firstNode, lastNode) {
    while (firstNode) {
      destinationElement.insertBefore(firstNode, null);
      firstNode = firstNode !== lastNode ? lastNode.parentNode.firstChild : null;
    }
  },

  removeRange(firstNode, lastNode) {
    let node = lastNode;

    do {
      const next = node.previousSibling;

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
    this.__smSetupFragment();
  }
});
