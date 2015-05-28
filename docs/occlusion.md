# Occlusion Culling

### What is occlusion culling?

Occlusion culling is a memory performance technique in which non-visible material is removed
from the rendering tree to improve the rendering performance of visible material.

### When do I need it?

Many common Web Application scenarios could benefit from occlusion, but typically this kind
of performance technique is overkill.  The most common need for occlusion is to support
an `infinite-scroll` component or similarly scrolling of large lists, either of which leads
to very large DOM trees.  Websites and apps optimized for Mobile usage, especially on Android
typically need more performance tuning as well.

### How does in work?

`smoke-and-mirrors` utilizes 3 types of culling.

- View + Dom Teardown
- View + Dom Caching
- Dom hiding

#### Dom hiding
This is accomplished by setting `visibility:hidden` on an element, which removes the
content from rendering without forcing a reflow.  This is not the same as `display:none`,
which would cause a reflow.

### Glimmer Update

The information below is only true for pre 0.2.0-beta.1 and before, beginning in beta.2 we
moved to nested components to be able to utilize `{{#each}}` semantics.  This reduced the
number of required views, as well as our ability to control the instantiation and rendering
of those views.  Both states below are now combined to simply `teardown`.

#### View + Dom Caching

View caching is accomplished by removing the view from the list of active views, preventing
normal teardown, and providing a lookup mechanism.  This allows us to keep a view around in
it's current state without needing to rebuild it should the user request it again in a short
time span.

The associated DOM element for a cached view is removed from the DOM, but not disposed of. When
a cached view is reactivated, this element is reattached.  Removing it from the tree improves
the tree's performance, but also maintains any associated bindings.  Some of the provided
`smoke-and-mirrors` components will leave a wrapper view in place with the height of the removed
content.  But otherwise, removing the element does cause a reflow.

#### View + Dom Teardown

If a View is sufficiently far enough away that keeping it in a cached state is no longer preferable
to rebuilding it when needed, the view and it's element are disposed of.  In lists, and
infinite scroll, removing content that is far enough off screen recovers a large share of memory.


