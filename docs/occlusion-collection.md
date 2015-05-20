# Occlusion Collection

Read the docs on [occlusion](./occlusion.md) to learn more about [Occlusion Culling](http://en.wikipedia.org/wiki/Hidden_surface_determination#Occlusion_culling)
and how `smoke-and-mirrors` implements it.

## Usage

**template.hbs**
```
<section class="infinite-scroll">
   {{occlusion-collection
     tagName="ul"
     itemViewClass="foo"
     contentToProxy=foosArray
     defaultHeight=100
     alwaysUseDefaultHeight=true
     containerSelector=".infinite-scroll"
     topReached="loadAbove"
     bottomReached="loadBelow"
   }}
 </section>
```

**example output html**
```
<section class="infinite-scroll">
  <ul class="occlusion-collection">
    <li class="occluded-view foo-occlusion">
      <div class="ember-view foo-view"></div>
    </li>
  </ul>
</section>
```

## Options

### Required

#### itemViewClass

The view to use for each item in the `contentToProxy` array. 
If you need dynamic item types, you can use a wrapper view to
swap out the view based on the model.

#### contentToProxy

An array of content to render.  The array is proxied through `MagicArray` before being used on screen.
If your content consists of Ember.Objects, the guid, is used to make `MagicArray` even faster. Alternatively,
specify `keyForId`.  See the [docs for MagicArray](./magic-array.md) to learn more.  See below for more
on `keyForId`.

This proxy behavior ensures that even should you do a full content swap, your performance doesn't suffer.
Just how fast is this proxy?  I've implemented the [*Ryan Florence Performance Test*™](http://discuss.emberjs.com/t/ryan-florences-react-talk-does-not-make-ember-look-very-good/7223)
(aka [Glimmer Demo](https://dbmonster.firebaseapp.com/)) using [Ember 1.11.0 and `smoke-and-mirrors`](http://runspired.github.io/smoke-and-mirrors/#/dbmon-occlusion-collection).

Is Ember fast yet? [It doesn't matter what this says](https://is-ember-fast-yet.firebaseapp.com/), the answer is YES.
Just goes to show a good algorithm is always clutch ;)

#### defaultHeight

`default: 75`

This height is used to give the `OcclusionItem`s height prior to their content being rendered.
This height is replaced with the actual rendered height once content is rendered for the first time.

If your content will always have the height specified by `defaultHeight`, you can improve performance
by specifying `alwaysUseDefaultHeight: true`.

#### keyForId

The `keyForId` property improves performance when the underlying array is changed but most
of the items remain the same.  It is used by the [MagicArrayMixin](./magic-array.md).

If `useLocalStorageCache` is true, it is also used to cache the rendered heights of content in the list.

--------------------------------------------

### Optional

#### containerSelector

A jQuery selector string that will select the element from
which to calculate the viewable height and needed offsets.

This element will also have `scroll`, and `touchmove`
events added to it while the `occlusion-collection` component
is `inDOM`.

Usually this element will be the component's immediate parent element,
if so, you can leave this null.

The container height is calculated from this selector once.
If you expect height to change, `containerHeight` is observed
and triggers new view boundary calculations.


#### containerHeight

Set this if you need to dynamically change the height of the container
(useful for viewport resizing on mobile apps when the keyboard is open).

Changes to this property's value are observed and trigger new view boundary
calculations.

#### tagName

`default: div`

If itemTagName is blank or null, the `occlusion-collection` will [tag match](../addon/utils/get-tag-descendant.js)
with the `OcclusionItem`.

#### itemTagName

Used if you want to explicitly set the tagName of `OccludedView`s

#### loadingViewClass

The name of the view to render either above or below the existing content when
more items are being loaded.  For more information about how and when this is
used, see the `Actions` section below.


--------------------------------------------

### Performance Tuning

#### alwaysUseDefaultHeight

**Planned Feature, Not Enabled**

`default: false`

If true, dynamic height calculations are skipped and
`defaultHeight` is always used as the height of each `OccludedView`.

#### scrollThrottle

`default: 32`

Time (in ms) between attempts at re-rendering during scrolling.
A new render every ~16ms preserves 60fps. Most re-renders with
occlusion-culling have clocked well below 1ms.

#### cycleDelay

When scrolling, new on screen items are immediately handled.
`cycleDelay` sets the amount of time to debounce before updating
off screen items.

#### updateBatchSize

Sets how many items to update view state for at a time when updating
offscreen items.

#### visibleBuffer default .5

how much extra room to keep visible on
either side of the visible area

#### invisibleBuffer default .5

how much extra room to keep in DOM but
with `visible:false` set.

#### cacheBuffer default .5

sets how many views to cache in buffer
instead of tearing down on either side
of the revealed area

### Enabling CSS Animation

#### useHiddenAttr

`default: false`

**Note, this hasn't actually been enabled yet, and is currently true during
development.  This will not remain the case**

For performance reasons, by default the `occlusion-collection` does not add an extra
class or attribute to the `OccludedView`'s element when hiding or showing the element.

Should you need access to a state for using CSS animations, setting `useHiddenAttr` to
true will add the attribute `hidden` to the cloakedView when ever it's content is hidden,
cached, or culled.

--------------------------------------------

### Initial State

**Planned Feature, Not Enabled**

#### useLocalStorageCache

**Planned Feature, Not Enabled**

Whether to cache heights, topVisible index in local storage
when tearing down the component.  If true, the view state will be restored when
the component is loaded again.

Content is not cached, so to make this work seamlessly you will need to ensure that
a minimum of topVisible

#### keyForLocalStorage

**Planned Feature, Not Enabled**

The unique key to use when caching the component's state in storage

#### _scrollPosition

Launch to a specific scroll offset.  Height cacheing and requestAnimationFrame
will be used to ensure this happen seamlessly.

#### topVisibleIndex

**Planned Feature, Not Enabled**

Updated with the value of `keyForId` of the currently top visible element.
In the future, you will be able to set this to an index to launch the scroll
position with specific content visible.


--------------------------------------------

### Actions

#### bottomVisibleChanged

Specify an action to fire when the bottom on-screen item
changes.

It includes the index and content of the item now visible.

#### topVisibleChanged

Specify an action to fire when the top on-screen item
changes.

It includes the index and content of the item now visible.

#### bottomReached

Specify an action to fire when the bottom is reached.

This action will only fire once per unique bottom, and
is fired the moment the bottom-most element is visible, it does
not need to be on screen yet.

It will include the index and content of the item at the bottom,
as well as a promise.

```
{
 index: 0,
 item : {},
 promise: fn
}
```

The promise should be resolved once any loading is complete, or
rejected if loading has failed.

If `loadingViewClass` is defined, it will be inserted above existing content.

Rejecting the promise leaves the loadingView in place for 5s and set's
it's `loadingFailed` property to true.

**TODO this feature needs the `Promise` portion done.**

#### topReached

Specify an action to fire when the top is reached.

This action will only fire once per unique top, and
is fired the moment the top-most element is visible, it does
not need to be on screen yet.

It will include the index and content of the item at the top
as well as a promise.

```
{
 index: 0,
 item : {},
 promise: fn
}
```

The promise should be resolved once any loading is complete, or
rejected if loading has failed.

If `loadingViewClass` is defined, it will be inserted above existing content.

Rejecting the promise leaves the loadingView in place for 5s and set's
it's `loadingFailed` property to true.

**TODO this feature needs the `Promise` portion done.**

--------------------------------------------
