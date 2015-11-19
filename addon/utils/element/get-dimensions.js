import dimFromStr from './dim-from-str';
import getWidth from './get-width';
import getHeight from './get-height';

export default function getDimensions(element) {
  const computedStyle = window.getComputedStyle(element, null);
  const style = {
    width: dimFromStr(computedStyle.width),
    height: dimFromStr(computedStyle.height),
    marginLeft: dimFromStr(computedStyle.marginLeft),
    marginRight: dimFromStr(computedStyle.marginRight),
    marginTop: dimFromStr(computedStyle.marginTop),
    marginBottom: dimFromStr(computedStyle.marginBottom),
    paddingLeft: dimFromStr(computedStyle.paddingLeft),
    paddingRight: dimFromStr(computedStyle.paddingRight),
    paddingTop: dimFromStr(computedStyle.paddingTop),
    paddingBottom: dimFromStr(computedStyle.paddingBottom),
    borderLeftWidth: dimFromStr(computedStyle.borderLeftWidth),
    borderRightWidth: dimFromStr(computedStyle.borderRightWidth),
    borderTopWidth: dimFromStr(computedStyle.borderTopWidth),
    borderBottomWidth: dimFromStr(computedStyle.borderBottomWidth),
    boxSizing: computedStyle.boxSizing,
    fontSize: dimFromStr(computedStyle.fontSize),
    lineHeight: dimFromStr(computedStyle.lineHeight)
  };

  return {
    style,
    calc: {
      width: getWidth(style),
      height: getHeight(style),
      widthWithMargin: getWidth(style, true),
      heightWithMargin: getHeight(style, true)
    }
  };
}
