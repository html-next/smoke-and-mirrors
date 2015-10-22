var DEFAULT_COUNT = 10;
var URL_BASE = 'http://lorempixel.com';
var CATEGORIES = [
  'abstract',
  'city',
  'people',
  'transport',
  'food',
  'nature',
  'business',
  'nightlife',
  'sports',
  'cats',
  'fashion',
  'technics'
];

function booleanToss() {
  return Math.round(Math.random());
}

function isGray() {
  return booleanToss();
}

function getRandomNumber(min, max) {
  return Math.floor( Math.random() * (max + 1 - min) + min );
}

function getWidth() {
  return getRandomNumber(1500, 1920);
}


function getDynamicHeight() {
  return getRandomNumber(300, 600);
}

function getDynamicWidth(height, isPortrait) {
  return Math.round(isPortrait ? height / 16 * 9 : height / 9 * 16);
}

function generateImageId(index) {
  return (new Date()).getTime() + '-' + index;
}
function getId() {
  return getRandomNumber(0, 10);
}

function getCategoryIndex() {
  return getRandomNumber(0, CATEGORIES.length - 1);
}

function generateImageSrc(index) {
  var parts = [];
  var preview = [];
  parts.push(URL_BASE);
  preview.push(URL_BASE);
  if (isGray()) {
    parts.push('g');
    preview.push('g');
  }
  var width = getWidth();
  parts.push(width);
  parts.push(width);
  var small = 250;
  preview.push(small);
  preview.push(small);
  var cat = CATEGORIES[getCategoryIndex()];
  parts.push(cat);
  preview.push(cat);
  var id = getId();
  parts.push(id);
  preview.push(id);
  return {
    large: parts.join('/'),
    small: preview.join('/'),
    id: generateImageId(index)
  };
}

function generateDynamicImageSrc(index) {
  var parts = [];
  var preview = [];
  parts.push(URL_BASE);
  preview.push(URL_BASE);
  if (isGray()) {
    parts.push('g');
    preview.push('g');
  }
  var height = getDynamicHeight();
  var isPortrait = booleanToss();
  parts.push(height);
  parts.push(getDynamicWidth(height, isPortrait));
  var small = 100;
  preview.push(small);
  preview.push(getDynamicWidth(small, isPortrait));
  var cat = CATEGORIES[getCategoryIndex()];
  parts.push(cat);
  preview.push(cat);
  var id = getId();
  parts.push(id);
  preview.push(id);
  return {
    large: parts.join('/'),
    small: preview.join('/'),
    id: generateImageId(index)
  };
}

function getImages(count) {
  count = count || DEFAULT_COUNT;
  var imageUrls = [];

  for (var i = 1; i <= count; i++) {
    imageUrls.push(generateImageSrc(i));
  }

  return imageUrls;
}

function getDynamicImages(count) {
  count = count || DEFAULT_COUNT;
  var imageUrls = [];

  for (var i = 1; i <= count; i++) {
    imageUrls.push(generateDynamicImageSrc(i));
  }

  return imageUrls;
}

export default getImages;


export {
  getImages,
  getDynamicImages
};
