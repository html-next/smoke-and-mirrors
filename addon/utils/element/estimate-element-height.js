import { assert } from 'smoke-and-mirrors/-debug/helpers';

export default function estimateElementHeight(element, fallbackHeight) {
  assert(`You called estimateElement height without a fallbackHeight`, fallbackHeight);
  assert(`You called estimateElementHeight without an element`, element);

  if (fallbackHeight.indexOf('%') !== -1) {
    let parentHeight = element.parentNode.innerHeight;
    let per = parseFloat(fallbackHeight);

    return Math.max((per * parentHeight).toFixed(0), 1);
  }

  // px or no units
  if (fallbackHeight.indexOf('em') === -1) {
    fallbackHeight = parseInt(fallbackHeight, 10);

    return Math.max(fallbackHeight, 1);
  }

  const fontSize = window.getComputedStyle(element).getPropertyValue('font-size');
  fallbackHeight = parseFloat(fallbackHeight) * parseFloat(fontSize);

  return Math.max(fallbackHeight, 1);
}
