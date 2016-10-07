import { isNonZero } from './validate-style';

export function hasDimension(rect, prop) {
  return isNonZero(rect[prop]);
}

export function hasDimensionAbove(rect, prop, amount) {
  return hasDimension(rect, prop) && rect[prop] >= amount;
}

export function hasDimensionEqual(rect, prop, amount) {
  return hasDimension(rect, prop) && rect[prop] === amount;
}
