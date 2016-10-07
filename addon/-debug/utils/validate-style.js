
export function hasStyleValue(styles, key, value) {
  return styles[key] === value;
}

export function isNonZero(value) {
  let int = parseInt(value, 10);
  let float = parseFloat(value);

  return !isNaN(int) && (int !== 0 || float !== 0);
}

export function hasStyleWithNonZeroValue(styles, key) {
  return isNonZero(styles[key]);
}

export function styleIsOneOf(styles, key, values) {
  return styles[key] && values.indexOf(styles[key]) !== -1;
}

export function containsStyleValue(styles, key, value) {
  return styles[key] && styles[key].indexOf(value) !== -1;
}
