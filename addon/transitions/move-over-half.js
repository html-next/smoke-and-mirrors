import { stop, animate, Promise, isAnimating, finish } from "liquid-fire";
import jQuery from "jquery";

export default function moveOverHalf(dimension, direction, opts) {
  var oldParams = {};
  var newParams = {};
  var overlayParams = {};
  var firstStep;
  var property;
  var measure;

  var darkOpacity = 0.75;
  if (direction > 0) {
    // moving right
    overlayParams = {
      opacity: [0, darkOpacity]
    };
  } else {
    // moving left
    overlayParams = {
      opacity: [darkOpacity, 0]
    };
  }

  var overlay = jQuery('<div class="transition-overlay"></div>');
  this.oldElement.append(overlay);

  if (dimension.toLowerCase() === 'x') {
    property = 'translateX';
    measure = 'width';
  } else {
    property = 'translateY';
    measure = 'height';
  }

  if (isAnimating(this.oldElement, 'moving-in')) {
    firstStep = finish(this.oldElement, 'moving-in');
  } else {
    stop(this.oldElement);
    firstStep = Promise.resolve();
  }

  return firstStep.then(() => {
    var bigger = biggestSize(this, measure);

    this.oldElement[0].style.zIndex = direction > 0 ? 5 : 0;
    this.newElement[0].style.zIndex = direction > 0 ? 0 : 5;

    oldParams[property] = (bigger * (direction > 0 ? 1 : -0.5)) + 'px';
    newParams[property] = ["0px", (bigger * (direction > 0 ? -0.5 : 1)) + 'px'];

    return Promise.all([
      animate(overlay, overlayParams, opts),
      animate(this.oldElement, oldParams, opts),
      animate(this.newElement, newParams, opts, 'moving-in')
    ]);
  });
}

function biggestSize(context, dimension) {
  var sizes = [];
  if (context.newElement) {
    sizes.push(parseInt(context.newElement.css(dimension), 10));
    sizes.push(parseInt(context.newElement.parent().css(dimension), 10));
  }
  if (context.oldElement) {
    sizes.push(parseInt(context.oldElement.css(dimension), 10));
    sizes.push(parseInt(context.oldElement.parent().css(dimension), 10));
  }
  return Math.max.apply(null, sizes);
}
