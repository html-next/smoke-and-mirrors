/*globals Ember */
// import Ember from "ember-metal/core"; // Ember.assert, Ember.K
var merge = Ember.merge; // import merge from "ember-metal/merge";
var get = Ember.get; // import { get } from "ember-metal/property_get";
var set = Ember.set; // import { set } from "ember-metal/property_set";
var View = Ember.View; // import View from "ember-views/views/view";
var EmberError = Ember.Error; // import EmberError from "ember-metal/error";
var run = Ember.run; // import run from "ember-metal/run_loop";
// import {
//   cloneStates,
//   states as EmberViewStates
// } from "ember-views/views/states";
var StatesModule = Ember.__loader.require('ember-views/views/states');
var cloneStates = StatesModule.cloneStates;
var EmberViewStates = StatesModule.states;

/**
 @module ember
 @submodule ember-views
 */

var EmberRenderer = Ember.__loader.require('ember-views/system/renderer')['default'];

EmberRenderer.prototype.childViews = function(view) {
  if (view._firstChild) {
    // TODO: enable the renderer to loop over our linked list instead of generating an array AOT
    var views = [];
    var current = view._firstChild;
    while (current) {
      views.push(current);
      current = current._nextSibling;
    }
    return views;
  } else {
    return view._childViews;
  }
};


var states = cloneStates(EmberViewStates);

var CoreContainerView = View.extend({
  _states: states,

  _firstChild: null,
  _lastChild: null,

  pushObject: function(childView) {
    this.insertBefore(childView, null);
  },

  insertBefore: function(newChild, before) {
    if (!this._firstChild || this._firstChild === before) { this._firstChild = newChild; }

    // remove ourself from our previous and next siblings, this logic could probably be improved
    if (newChild._previousSibling) {
      newChild._previousSibling._nextSibling = newChild._nextSibling;

      if (!newChild._nextSibling) { this._lastChild = newChild._previousSibling; }
    }
    if (newChild._nextSibling) {
      newChild._nextSibling._previousSibling = newChild._previousSibling;
    }

    // relocate the view
    if (before) {
      newChild._previousSibling = before._previousSibling;
      newChild._nextSibling = before;
      if (before._previousSibling) { before._previousSibling._nextSibling = newChild; }
      before._previousSibling = newChild;
    } else if (this._lastChild !== newChild) {
      newChild._previousSibling = this._lastChild;
      if (this._lastChild) {
        this._lastChild._nextSibling = newChild;
      }
      this._lastChild = newChild;
    }

    set(newChild, '_parentView', this); // only needed if we don't use createChildView
    newChild.container = this.container;

    run.scheduleOnce('render', this, '_ensureChildrenAreInDOM');
  },

  /**
   Instructs each child view to render to the passed render buffer.

   @private
   @method render
   @param {Ember.RenderBuffer} buffer the buffer to render to
   */
  render: function(buffer) {
    var element = buffer.element();
    var dom = buffer.dom;

    if (this.tagName === '') {
      element = dom.createDocumentFragment();
      buffer._element = element;
      this._childViewsMorph = dom.appendMorph(element, this._morph.contextualElement);
    } else {
      this._childViewsMorph = dom.appendMorph(element);
    }

    return element;
  },

  instrumentName: 'core_container',

  removeChild: function(child) {
    if (child._previousSibling) { child._previousSibling._nextSibling = child._nextSibling; }
    if (child._nextSibling) { child._nextSibling._previousSibling = child._previousSibling; }
    if (this._firstChild === child) { this._firstChild = child._nextSibling; }
    if (this._lastChild === child) { this._lastChild = child._previousSibling; }
    child.remove();
    // set(child, '_parentView', null); // FML, this will trigger a rerender :'(
    return this;
  },

  _ensureChildrenAreInDOM: function () {
    this.currentState.ensureChildrenAreInDOM(this);
  }
});

merge(states._default, {
  childViewsWillChange: Ember.K,
  childViewsDidChange: Ember.K,
  ensureChildrenAreInDOM: Ember.K
});

merge(states.inBuffer, {
  childViewsDidChange: function(parentView, views, start, added) {
    throw new EmberError('You cannot modify child views while in the inBuffer state');
  }
});

merge(states.hasElement, {
  ensureChildrenAreInDOM: function(view) {
    var renderer = view._renderer;

    var currentChild = view._lastChild;
    var currentMorph = view._childViewsMorph.lastChildMorph;

    while (currentChild) {
      if (currentChild._morph) {
        if (currentChild._morph !== currentMorph) {
          view._childViewsMorph.insertBeforeMorph(currentChild._morph, currentMorph.nextMorph);
          currentMorph = currentChild._morph;
        }
      } else {
        var refMorph = currentMorph ? currentMorph.nextMorph : view._childViewsMorph.firstChildMorph;
        renderer.renderTree(currentChild, view, refMorph);

        currentMorph = currentChild._morph;
      }

      currentChild = currentChild._previousSibling;
      currentMorph = currentMorph.previousMorph;
    }
  }
});

export default CoreContainerView;
