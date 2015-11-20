export default function(start, total, prefix) {
  prefix = prefix || '';
  let i;
  let ret = [];
  for (i = start; i < start + total; i++) {
    ret.push({
      number: i,
      prefixed: prefix + i
    });
  }
  return ret;
}
