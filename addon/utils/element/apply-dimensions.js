export default function applyDimensions(element, dimensions) {
  for (let i in dimensions.style) {
    if (dimensions.style.hasOwnProperty(i)) {
      element.style[i] = i === 'boxSizing' ? dimensions.style[i] : `${dimensions.style[i]}px`;
    }
  }
}
