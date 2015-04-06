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
    content=foosArray
    defaultHeight=100
    alwaysUseDefaultHeight=true
    containerSelector=".infinite-scroll"
    loadingView="loadingFoo"
    fetchMore="fetchMoreFoosAction"
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

This height is used to give the `OcclusionView`s height prior to their content being rendered.
This height is replaced with the actual rendered height once content is rendered for the first time.

If your content will always have the height specified by `defaultHeight`, you can improve performance
by specifying `alwaysUseDefaultHeight: true`.

#### containerSelector

``

#### scrollSelector

#### containerHeight


--------------------------------------------

### Optional

#### tagName

`default: div`

The `occlusion-collection` will [tag match](../addon/utils/get-tag-descendant.js) the `occluded-view`.

#### keyForId

The `keyForId` property improves performance when the underlying array is changed but most
of the items remain the same.  It is used by the [MagicArrayMixin](./magic-array.md).

If `cacheListState` is true, it is also used to cache the rendered heights of content in the list.

#### loadingViewClass




--------------------------------------------

### Performance Tuning

#### alwaysUseDefaultHeight

`default: false`

If `defaultHeight` will always be the actual height of a rendered view, set this to `true`
to improve performance by avoiding unnecessary height getting/setting.

#### scrollDebounce

#### cycleDelay

#### updateBatchSize

#### visibleBuffer defauly 1

#### invisibleBuffer default 1

#### cacheBuffer default .5

### Enabling CSS Animation

#### useHiddenAttr

`default: false`

For performance reasons, by default the occlusion-collection does not add an extra class or
attribute to the `occlusion-view`'s element when hiding or showing the element.

Should you need access to a state for animations, setting `useHiddenAttr` to true
will add the attribute `hidden` to the cloakedView when ever it's content is hidden, cached, or
culled.

--------------------------------------------

### Initial State

#### useLocalStorageCache

#### _scrollPosition

#### _topVisible

#### _bottomVisible

--------------------------------------------

### Actions

#### bottomVisibleChanged

#### topVisibleChanged

#### bottomReached

#### topReached

--------------------------------------------




















