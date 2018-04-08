import { getDynamicHeight, booleanToss, getDynamicWidth } from './get-images';

export default function(start, total, prefix = '') {
  let ret = [];
  let height;

  for (let i = start; i < start + total; i++) {
    height = getDynamicHeight();
    ret.push({
      number: i,
      height,
      width: getDynamicWidth(height, booleanToss()),
      prefixed: prefix + i
    });
  }

  return ret;
}
