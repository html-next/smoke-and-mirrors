export default function(start, total) {
  let i;
  let ret = [];
  for (i = start; i < start + total; i++) {
    ret.push({
      number: i
    });
  }
  return ret;
}
