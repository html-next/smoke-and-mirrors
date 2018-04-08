/*
 * automatic tag matching for lists, selects, and tables
 *
 * @param {String} tag an html tagName
 * @returns {String} tag a new html tagName
 */
export default function getTagDescendant(tag) {
  switch (tag) {
    case 'occlusion-collection':
      return 'occlusion-item';
    case 'vertical-collection':
      return 'vertical-item';
    case 'horizontal-collection':
      return 'horizontal-item';
    case 'tbody':
    case 'table':
    case 'thead':
    case 'tfoot':
      return 'tr';
    case 'tr':
    case 'th':
      return 'td';
    case 'ul':
    case 'ol':
      return 'li';
    case 'select':
    case 'optgroup':
      return 'option';
    default:
      return 'div';
  }
}
