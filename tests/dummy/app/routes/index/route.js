import Ember from 'ember';

const {
  A,
  guidFor,
  Route
  } = Ember;

const STR_BASE = 'abcdefghijklmnopqrstuvwkyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
const WORD_LENGTH = 10;

function getRandomNumber(min, max) {
  return Math.floor(Math.random() * (max + 1 - min) + min);
}

function makeRandomString(min, max) {
  let len = getRandomNumber(min + 1, max);
  let words = [];

  while (len > 0) {
    let strLen = getRandomNumber(1, Math.min(len, WORD_LENGTH));
    let word = '';

    len -= strLen;
    strLen -= 1;

    while (strLen > 0) {
      word += STR_BASE[getRandomNumber(0, 52)];
      strLen--;
    }

    words.push(word);
  }

  return words.join(' ');
}

function makeEntries(num) {
  let ret = [];

  for (let i = 0; i < num; i++) {
    let entry = {
      title: makeRandomString(20, 75),
      post: makeRandomString(140, 640)
    };
    entry.id = guidFor(entry);
    ret.push(entry);
  }

  return ret;
}

export default Route.extend({

  model() {
    return new A(makeEntries(10));
  },

  actions: {

    loadMoreAbove() {
      let model = this.modelFor('index');

      model.unshiftObjects(makeEntries(5));
    },

    loadMoreBelow() {
      let model = this.modelFor('index');

      model.pushObjects(makeEntries(5));
    }
  }

});
