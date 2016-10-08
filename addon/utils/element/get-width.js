export default function getWidth(dims, withMargins) {
  let width;

  switch (dims.boxSizing) {
    case 'border-box':
      width = dims.width +
      dims.borderLeftWidth + dims.borderRightWidth +
      dims.paddingLeft + dims.paddingRight;
      break;
    case 'content-box':
      width = dims.width;
      break;
    default:
      width = dims.width;
      break;
  }
  if (withMargins) {
    width += dims.marginLeft + dims.marginRight;
  }
  return width;
}
