import Ember from 'ember';
import layout from '../templates/components/pre-renderer';
import PreRenderContainer from '../models/pre-render-container';
import NullObject from '../utils/null-object';

const {
  Component,
  computed,
  merge,
  Handlebars
  } = Ember;

const {
  SafeString
  } = Handlebars;

const ENFORCED_STYLES = {
  position: 'absolute',
  left: '-10000px',
  top: '0px',
  maxWidth: '9999px',
  opacity: 0
};

export default Component.extend({
  layout: layout,
  attributeBindings: ['style'],
  styles: null,

  style: computed('styles', function() {
    let style = '';
    const styles = this.get('styles');
    Object.keys(styles).forEach((key) => {
      style += `${key}:${styles[key]};`;
    });
    return SafeString(style);
  }),

  children: null,

  register(component) {
    this.children[component.elementId] = new PreRenderContainer(this.element, component);
  },

  unregister(component) {
    let container = this.children[component.elementId];
    if (container) {
      container.destroy();
    }
    this.children[component.elementId] = null;
  },

  willDestroy() {
    this._super();
    let i;
    for (i in this.children) {
      if (this.children[i] && this.children.hasOwnProperty(i)) {
        this.children[i].destroy();
        this.children[i] = null;
      }
    }
    this.children = null;
  },

  init() {
    this._super();
    let styles = this.get('styles') || {};
    this.children = new NullObject();
    this.set('styles', merge(styles, ENFORCED_STYLES));
  }

});
