const VENDOR_MATCH_FNS = ['matches', 'webkitMatchesSelector', 'mozMatchesSelector', 'msMatchesSelector', 'oMatchesSelector'];
let ELEMENT_MATCH_FN;

VENDOR_MATCH_FNS.some((fn) => {
  if (typeof document.body[fn] === 'function') {
    ELEMENT_MATCH_FN = fn;
    return true;
  }
  return false;
});

export default function closest(el, selector) {
  while (el) {
    if (el[ELEMENT_MATCH_FN](selector)) {
      return el;
    }
    el = el.parentElement;
  }

  return null;
}
