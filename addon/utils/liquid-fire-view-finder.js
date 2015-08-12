import Ember from 'ember';

const {
  get: get
  } = Ember;

function hasChildView(view) {
  return view && view._childViews && view._childViews.length;
}

function getFirstChildView(view) {
  return view._childViews && view._childViews.length ? view._childViews[0] : null;
}

function isRealChild(view) {
  return view && (get(view, 'isExplicitTaglessView') || view.element);
}

export default function getRealChildView(view) {

  var maxDepth = 6;
  var curDepth = 0;
  view = getFirstChildView(view);
  while (!isRealChild(view) && (curDepth++ <= maxDepth) && hasChildView(view)) {
    view = getFirstChildView(view);
  }
  return view;

}
