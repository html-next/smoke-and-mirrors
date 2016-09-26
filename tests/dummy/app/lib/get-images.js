const DEFAULT_COUNT = 10;
const URL_BASE = 'http://lorempixel.com';
const CATEGORIES = [
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

export function booleanToss() {
  return Math.round(Math.random());
}

function isGray() {
  return booleanToss();
}

function getRandomNumber(min, max) {
  return Math.floor(Math.random() * (max + 1 - min) + min);
}

function getWidth() {
  return getRandomNumber(1500, 1920);
}

export function getDynamicHeight() {
  return getRandomNumber(300, 600);
}

export function getDynamicWidth(height, isPortrait) {
  return Math.round(isPortrait ? height / 16 * 9 : height / 9 * 16);
}

function generateImageId(index) {
  return `${((new Date()).getTime())}-${index}`;
}
function getId() {
  return getRandomNumber(0, 10);
}

function getCategoryIndex() {
  return getRandomNumber(0, CATEGORIES.length - 1);
}

function generateImageSrc(index) {
  const parts = [];
  const preview = [];

  parts.push(URL_BASE);
  preview.push(URL_BASE);
  if (isGray()) {
    parts.push('g');
    preview.push('g');
  }

  const width = getWidth();

  parts.push(width);
  parts.push(width);

  const small = 250;
  preview.push(small);
  preview.push(small);

  const cat = CATEGORIES[getCategoryIndex()];

  parts.push(cat);
  preview.push(cat);

  const id = getId();

  parts.push(id);
  preview.push(id);

  return {
    large: parts.join('/'),
    small: preview.join('/'),
    id: generateImageId(index)
  };
}

function generateDynamicImageSrc(index) {
  const parts = [];
  const preview = [];

  parts.push(URL_BASE);
  preview.push(URL_BASE);
  if (isGray()) {
    parts.push('g');
    preview.push('g');
  }

  const height = getDynamicHeight();
  const isPortrait = booleanToss();
  const width = getDynamicWidth(height, isPortrait);

  parts.push(width);
  parts.push(height);

  const smallWidth = 100;
  const smallHeight = getDynamicWidth(smallWidth, isPortrait);

  preview.push(smallWidth);
  preview.push(smallHeight);

  const cat = CATEGORIES[getCategoryIndex()];

  parts.push(cat);
  preview.push(cat);

  const id = getId();

  parts.push(id);
  preview.push(id);

  return {
    large: parts.join('/'),
    small: preview.join('/'),
    id: generateImageId(index),
    width,
    height,
    previewWidth: smallWidth,
    previewHeight: smallHeight
  };
}

function getImages(count) {
  count = count || DEFAULT_COUNT;
  const imageUrls = [];

  for (let i = 1; i <= count; i++) {
    imageUrls.push(generateImageSrc(i));
  }

  return imageUrls;
}

function getDynamicImages(count) {
  count = count || DEFAULT_COUNT;
  const imageUrls = [];

  for (let i = 1; i <= count; i++) {
    imageUrls.push(generateDynamicImageSrc(i));
  }

  return imageUrls;
}

export default getImages;

export {
  getImages,
  getDynamicImages
};
