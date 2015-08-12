import { Promise } from "liquid-fire";
import getRealChildView from '../utils/liquid-fire-view-finder';

// This is what we run when no animation is asked for. It just sets
// the newly-added element to visible (because we always start them
// out invisible so that services can control their initial
// appearance).
export default function defaultTransition() {
  if (this.newElement) {
    this.newElement.css({visibility: ''});
  }
  if (this.newView) {
    var view = getRealChildView(this.newView);
    if (view && view.didAnimateTransition) {
      view.didAnimateTransition();
    }
  }
  return Promise.resolve();
}
