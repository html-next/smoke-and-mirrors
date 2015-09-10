/**!
 * automatic tag matching for lists, selects, and tables
 */
export default function getTagDescendant(tag) {
  switch (tag) {
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
