import Ember from 'ember';
import layout from './template';

const {
  Component,
  computed
  } = Ember;

const base = (255 * 255 * 255);

function setOrder(number, rgb) {
  let point = base / 6;
  if ( number <= point ) {
    return rgb;
  }
  if (number <= point * 2) {
    return {
      r: rgb.r,
      g: rgb.b,
      b: rgb.g
    }
  }
  if (number <= point * 3) {
    return {
      r: rgb.b,
      g: rgb.r,
      b: rgb.g
    }
  }
  if (number <= point * 4) {
    return {
      r: rgb.g,
      g: rgb.r,
      b: rgb.b
    }
  }
  if (number <= point * 5) {
    return {
      r: rgb.b,
      g: rgb.g,
      b: rgb.r
    }
  }
  return {
    r: rgb.g,
    g: rgb.b,
    b: rgb.r
  }
}

function numberToRGB(number) {
  let num = number;
  number+= 385;
  "use strict";
  let r = number > 255 ? 255 : number;
  number = r === 255 ? number - 255 : 0;
  let g = number > 255 ? 255 : number;
  number = g === 255 ? number - 255 : 0;
  let b = number;

  return setOrder(num * 16000, {
    r, g, b
  })
}

export default Component.extend({
  tagName: 'number-slide',
  attributeBindings: ['style'],
  style: computed('number', function() {
    let num = parseInt(this.get('number'), 10);
    if (num < 0) {
      num = base + num;
    }
    let c = numberToRGB(num);
    console.log('color', c, num);
    return `background: rgb(${c.r},${c.g},${c.b});`;
  }),
  layout: layout,
  index: 0,
  number: 0
});
