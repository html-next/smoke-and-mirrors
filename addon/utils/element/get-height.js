export default function getHeight(dims, withMargins) {
  let height;

  switch (dims.boxSizing) {
    case 'border-box':
      height = dims.height +
      dims.borderTopWidth + dims.borderBottomWidth +
      dims.paddingTop + dims.paddingBottom;
      break;
    case 'content-box':
      height = dims.height;
      break;
    default:
      height = dims.height;
      break;
  }
  if (withMargins) {
    height += dims.marginTop + dims.marginBottom;
  }
  return height;
}
