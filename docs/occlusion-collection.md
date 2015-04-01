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

### (optional) tagName

`default: div`

The `occlusion-collection` will [tag match](../addon/utils/get-tag-descendant.js) `occluded-view`.


### itemViewClass

The name of the view to use to render 

### content

An array of content to render.  The array is proxied through `MagicArray` before being used on screen.
If your content consists of Ember.Objects, the guid, is used to make `MagicArray` even faster. Alternatively,
specify `keyForView`.  See the [docs for MagicArray](./magic-array.md) to learn more.  See below for more
on `keyForView`.

This proxy behavior ensures that even should you do a full content swap, your performance doesn't suffer.
Just how fast is this proxy?  I've implemented the [*Ryan Florence Performance Test*™](http://discuss.emberjs.com/t/ryan-florences-react-talk-does-not-make-ember-look-very-good/7223)
(aka [Glimmer Demo](https://dbmonster.firebaseapp.com/)) using [Ember 1.11.0 and `smoke-and-mirrors`]().

Is Ember fast yet? [It doesn't matter what this says](https://is-ember-fast-yet.firebaseapp.com/), the answer is YES.
Just goes to show a good algorithm is always clutch ;)

### keyForView



### (optional) useHiddenAttr

`default: false`

For performance reasons, by default the occlusion-collection does not add an extra class or
attribute to the `occlusion-view`'s element when hiding or showing the element.

Should you need access to a state for animations, setting `useHiddenAttr` to true
will add the attribute `hidden` to the cloakedView when ever it's content is hidden, cached, or
culled.
