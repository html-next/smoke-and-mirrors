Smoke-and-mirrors
=================

[![npm version](https://badge.fury.io/js/smoke-and-mirrors.svg)](http://badge.fury.io/js/smoke-and-mirrors)
[![Build Status](https://travis-ci.org/runspired/smoke-and-mirrors.svg)](https://travis-ci.org/runspired/smoke-and-mirrors)
[![Ember Observer Score](http://emberobserver.com/badges/smoke-and-mirrors.svg)](http://emberobserver.com/addons/smoke-and-mirrors)
[![Coverage Status](https://coveralls.io/repos/runspired/smoke-and-mirrors/badge.svg?branch=master&service=github)](https://coveralls.io/github/runspired/smoke-and-mirrors?branch=master)

`Smoke-and-mirrors` is an `ember-addon` that focuses on improving initial and re-render performance in high-stress
situations by providing components and primitives for performant lists and `svelte renders` to match a core belief:
**Don't render the universe, render the scene.**

#### TL;DR svelte render: the fewer things you need to render, the faster your renders will be.

Your web page is a universe, your viewport is the scene. Much like you wouldn't expect a video game to render
out-of-scene content, your application should smartly cull the content it doesn't need to care about.  Trimming
excess content let's the browser perform both initial renders and re-renders at far higher frame-rates, as the only
content it needs to focus on for layout is the content the user can see.

`Smoke-and-mirrors` augments your existing app, it doesn't ask you to rewrite layouts or logic in order to use it.
It will try it's best to allow you to keep the conventions, structures, and layouts you want.

### Support

For support, please ask questions in the [#smoke-and-mirrors](https://embercommunity.slack.com/messages/smoke-and-mirrors/)
 channel of the [ember-community slack](https://ember-community-slackin.herokuapp.com/).

--------------------------------------------------------------------------

## Features

### Infinite Scroll (bi-directional)

Infinite scroll that remains performant even for very long lists is easily achievable 
with the [`vertical-collection`](http://runspired.github.io/smoke-and-mirrors/#/available-components/vertical-collection).
It works via a scrollable div or scrollable body.

 - [bi-directional scrollable div](http://runspired.github.io/smoke-and-mirrors/#/examples/infinite-scroll)
 - [scrollable body](http://runspired.github.io/smoke-and-mirrors/#/examples/scrollable-body)
 - [dynamic content sizes](http://runspired.github.io/smoke-and-mirrors/#/examples/flexible-layout)
 - [as a table](http://runspired.github.io/smoke-and-mirrors/#/examples/dbmon)

#### Horizontal Scrolling

All of the above demos work horizontally as well via the `horizontal-collection`.

#### Grid Scrolling

All of the above demos (both horizontal and vertical) work as well via

 - `grid-collection`
 - `horizontal-grid`
 - `vertical-grid`

### Svelte Anything

Under the hood, smoke-and-mirrors is using a powerful scroll-tracking abstraction for each of the components above.
 That abstraction is made available as a service.

--------------------------------------------------------------------------

### Dependencies

`smoke-and-mirrors` is dependent on and installs `ember-run-raf`, which helps you budget and schedule the work in your
app more intelligently.

--------------------------------------------------------------------------

### Documentation

For updated documentation, announcements, and demos running the latest release please 
visit [http://runspired.github.io/smoke-and-mirrors/](http://runspired.github.io/smoke-and-mirrors/)
