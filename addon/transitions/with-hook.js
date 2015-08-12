import getRealChildView from '../utils/liquid-fire-view-finder';

export default function defaultTransition(delegateTo, ...args) {
  return this.lookup(delegateTo).apply(this, args).then((infos) => {
    if (this.newView) {
      var view = getRealChildView(this.newView);
      if (view && view.didAnimateTransition) {
        view.didAnimateTransition();
      }
    }
    return infos;
  });
}
