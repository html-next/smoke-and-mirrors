
## Ember and Performance

**Q: Aren't *Glimmer* and *Fastboot* coming?  Don't they solve all our performance problems?**

**A: No**

Both of these enhancements push Ember into a new, performance rich future.  Sometimes though,
this isn't enough.  This library is here for you when it's not, and honestly, many features
here should only be utilized *when* it's not, and no sooner.

##Optimization Guide

**The first rule of optimization:** There is no substitute to a well implemented algorithm.

**The second rule of optimization:** Hit the low hanging fruit first.

If performance matters to you, you should optimize your existing code before looking to these
features as a magic fix.  Making sure your code base has been optimized in other critical but
easily attainable ways will ensure you aren't using something you don't need to be.

### Use `Ember.run.schedule`

Don't rely on `setTimeout` or `setInterval` anywhere.  Ember uses `backburner`, an amazing callback
manager library they build just to ensure that asynchronous code is executed in an efficient and orderly
manner.  Animations and rendering both suffer when asynchronous callbacks execute in the middle of
their cycle.  If your animations are choppy, or if views render "in parts", you likely need to
re-evaluate the order of operations of your asynchronous code.  The worst thing that can happen to
you is for garbage collection to fire off mid-render, completely freezing your app for a lengthy and
noticeable series of frames.

`Ember.run.schedule` lets you specify exactly where in the order of operations your callback needs to be.
If you can do it on a `schedule`, don't do it `later`.

### Do not use jQuery animate.

Use pure CSS Animations or `Velocity.js` backed Animations. Do not use jQuery to animate.  jQuery's animation
mechanism is poorly optimized and will lead to scheduling conflicts.

### Be cautious with GPU acceleration

Acceleration is great for boosting the last little bit to get 60fps.  Accelerate everything though and you
overload the GPU and end up using hard storage to finish off the process.  You would have been much better
off using the CPU only.  Keeping your CSS orderly with clear notes of what/how/where acceleration is
triggered is important for ensuring you don't bring your rendering and animation to a screaming halt.  This
affects Android devices far worse and more often than iOS or desktop browsers.

### Careful how you update the underlying array passed to {{#each}}

`{{#each}}` re-renders all of its content when the underlying array changes.  It re-renders only what's
changed if the array's content changes.  Make sure you make changes to the array's content and don't
just swap out the array.  If you've got a table of data that's updating quickly in real-time (perhaps like
the table shown in fastboot), one solution is to reuse POJOs within that array instead of tearing them down.

You'll find the `wrapForEach` helper is actually just converting objects to POJOs and reusing them as much
as possible. (and `MagicCollectionView` may even do a better job of view and object reuse depending on scenario).


### {{unbound my-prop}}

Unbind as much as you can.  Especially on complex views.

### Ember.computed.oneWay

Unidirectional data flow doesn't just save you from yourself, in some situations it's much more performant.

### Cache Data

Cache data to local storage.  `ember-orbit` is great.  If you are using `ember-data`, setup your adapter to
look for a record in local storage before firing off that request.

### Use WebWorkers

You can get parallelism in your app using WebWorkers.  This library provides a few utilities for helping you
get started using WebWorkers.  Best Places to consider using workers:

- data munging, normalization, and serialization
- WebSocket connections and XMLHttpRequests
- Intensive computations

You could even write most of your adapter to run in a web worker, from where it can access both localStorage
and make requests as needed.

### Background Load

Instead of grabbing new data in a route's model hook, return `DS.Store.filter` or `DS.Store.all` and schedule
a task in the background to load fresh data.  Combined with an adapter in web worker, this sort of background
loading can really boost performance.
