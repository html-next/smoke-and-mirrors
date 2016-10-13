import Ember from 'ember';
import Visualization from './visualization';
import Container from '../../-private/radar/models/container';

const {
  assert,
  warn,
  computed,
  Mixin
  } = Ember;

import {
  styleIsOneOf,
  hasStyleValue,
  hasStyleWithNonZeroValue
} from '../utils/validate-style';

import {
  hasCSSRule
} from '../utils/validate-css';

import {
  hasDimensionAbove,
  hasDimensionEqual
} from '../utils/validate-rect';

export default Mixin.create({
  debug: false,
  debugCSS: false,
  showEdges: computed.alias('debug'),

  _nextVisualization: null,

  toggleEdgeVisualization() {
    this.toggleProperty('debug');
  },

  visualization: null,
  didInsertElement() {
    this._super();
    if (this.get('debug')) {
      this.visualization = new Visualization(this);
      requestAnimationFrame(() => {
        this.visualize();
      });
    }

    if (this.get('debugCSS')) {
      this.detectIssuesWithCSS();
    }
  },

  detectIssuesWithCSS() {
    let defaultHeight = this.get('defaultHeight');
    let radar = this.radar;
    let styles;
    let rules;
    let rect;

    // check telescope
    if (radar.telescope !== Container) {
      styles = window.getComputedStyle(radar.telescope);
      rules = window.getMatchedCSSRules(radar.telescope);
      rect = radar.telescope.getBoundingClientRect();
    } else {
      styles = window.getComputedStyle(document.body);
      rules = window.getMatchedCSSRules(document.body);
      rect = radar.telescope.getBoundingClientRect();
    }

    assert(`Telescope cannot be inline.`, styleIsOneOf(styles, 'display', ['block', 'inline-block', 'flex', 'inline-flex']));
    assert(`Telescope must define position`, styleIsOneOf(styles, 'position', ['static', 'relative', 'absolute']));
    assert(`Telescope must define height`, hasStyleWithNonZeroValue(styles, 'height'));
    assert(`Telescope must define max-height`, hasStyleWithNonZeroValue(styles, 'max-height'));
    assert(`Telescope has height greater than the default height when no items are present`, hasDimensionAbove(rect, 'height', defaultHeight));

    // conditional perf check for non-body scrolling
    if (radar.telescope !== Container) {
      warn(`Telescope must define -webkit-overflow-scrolling`, hasCSSRule(rules, '-webkit-overflow-scrolling', 'touch'), { id: 'smoke-and-mirrors:debug-css-webkit-scroll' });
      warn(`Telescope must define overflow-scrolling`, hasCSSRule(styles, 'overflow-scrolling', 'touch'), { id: 'smoke-and-mirrors:debug-css-scroll' });
      assert(`Telescope must define overflow-y`, hasStyleValue(styles, 'overflow-y', 'scroll') || hasStyleValue(styles, 'overflow', 'scroll'));
    }

    // check sky
    styles = window.getComputedStyle(radar.sky);
    rules = window.getMatchedCSSRules(radar.sky);
    rect = radar.sky.getBoundingClientRect();

    assert(`Sky cannot be inline.`, styleIsOneOf(styles, 'display', ['block', 'inline-block', 'flex', 'inline-flex']));
    assert(`Sky must define position`, styleIsOneOf(styles, 'position', ['static', 'relative', 'absolute']));
    assert(`Sky must define height`, hasStyleWithNonZeroValue(styles, 'height'));
    assert(`Sky must define min-height`, hasStyleWithNonZeroValue(styles, 'min-height'));
    assert(`Sky has height greater than the default height when no items are present`, hasDimensionAbove(rect, 'height', defaultHeight));

    // check item defaults
    requestAnimationFrame(() => {
      this.set('shouldRender', false);

      assert(`You must supply at least one item to the collection to debug it's CSS.`, this.get('items.length'));

      let element = radar.sky.firstElementChild;

      styles = window.getComputedStyle(element);
      rules = window.getMatchedCSSRules(element);
      rect = element.getBoundingClientRect();

      assert(`Item cannot be inline.`, styleIsOneOf(styles, 'display', ['block', 'inline-block', 'flex', 'inline-flex']));
      assert(`Item must define position`, styleIsOneOf(styles, 'position', ['static', 'relative', 'absolute']));
      assert(`Item must define height`, hasStyleWithNonZeroValue(styles, 'height'));
      assert(`Item must define min-height`, hasStyleWithNonZeroValue(styles, 'min-height'));
      assert(`Item has height equal to the default height when not rendered`, hasDimensionEqual(rect, 'height', defaultHeight));

      this.set('shouldRender', true);

      requestAnimationFrame(() => {
        element.style.minHeight = '';
        element.style.height = '';

        if (element.children.length === 1) {
          element = element.firstElementChild;
          styles = window.getComputedStyle(element);
          rules = window.getMatchedCSSRules(element);
          rect = element.getBoundingClientRect();

          assert(`Item yield cannot be inline.`, styleIsOneOf(styles, 'display', ['block', 'inline-block', 'flex', 'inline-flex']));
          assert(`Item yield has height equal to the default height when rendered`, hasDimensionAbove(rect, 'height', defaultHeight));
        } else {
          styles = window.getComputedStyle(element);
          rules = window.getMatchedCSSRules(element);
          rect = element.getBoundingClientRect();

          assert(`Item has height at least equal to the default height when rendered`, hasDimensionAbove(rect, 'height', defaultHeight));
        }
      });
    });
  },

  visualize() {
    if (!this.get('debug')) {
      if (this.visualization) {
        this.visualization.destroy();
        this.visualization = null;
      }
      return;
    }

    if (this.visualization) {
      this.visualization.render();
      requestAnimationFrame(() => {
        this.visualize();
      });
    }
  },

  willDestroy() {
    this._super();
    if (this.visualization) {
      this.visualization.destroy();
      this.visualization = null;
    }
  }
});

