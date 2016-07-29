export default function estimateHeight(px) {
  let _defaultHeight;
  const defaultHeight = `${px}`;

  if (defaultHeight.indexOf('em') === -1) {
    _defaultHeight = parseInt(defaultHeight, 10);
    return _defaultHeight;
  }

  let element;

  // use body if rem
  if (defaultHeight.indexOf('rem') !== -1) {
    element = window.document.body;
    _defaultHeight = 1;
  } else {
    element = this.get('element');
    if (!element || !element.parentNode) {
      element = window.document.body;
    } else {
      _defaultHeight = 1;
    }
  }

  const fontSize = window.getComputedStyle(element).getPropertyValue('font-size');

  if (_defaultHeight) {
    _defaultHeight = parseFloat(defaultHeight) * parseFloat(fontSize);

    return _defaultHeight;
  }

  return parseFloat(defaultHeight) * parseFloat(fontSize);
}
