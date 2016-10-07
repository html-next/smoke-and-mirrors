export function hasCSSRule(rules, prop, value) {
  let styleStr = `${prop}:\\s*${value}`;
  let expr = new RegExp(styleStr, ['i']);

  for (let i = 0; i < rules.length; i++) {
    if (expr.test(rules[i].cssText)) {
      return true;
    }
  }

  return false;
}
