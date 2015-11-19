Smoke-and-mirrors
=================

[![npm version](https://badge.fury.io/js/smoke-and-mirrors.svg)](http://badge.fury.io/js/smoke-and-mirrors)
[![Build Status](https://travis-ci.org/runspired/smoke-and-mirrors.svg)](https://travis-ci.org/runspired/smoke-and-mirrors)
[![Ember Observer Score](http://emberobserver.com/badges/smoke-and-mirrors.svg)](http://emberobserver.com/addons/smoke-and-mirrors)
[![Coverage Status](https://coveralls.io/repos/runspired/smoke-and-mirrors/badge.svg?branch=master&service=github)](https://coveralls.io/github/runspired/smoke-and-mirrors?branch=master)

Sometimes being "ambitious" gets you in trouble.  When it does, `smoke-and-mirrors` is here
to put out the fire.

`Smoke-and-mirrors` is an `ember-addon` that exposes performance minded `components` and primitives 
to help you deliver your ambitions without sacrifice or compromise.

## Features

 `smoke-and-mirrors` offers a suite of services, primitives, mixins, and components, but the primary focus is
 giving you a `svelte render`.  TL;DR the fewer things you need to render, the faster your renders will be.
 
 To that end, the main component of the library is the [`vertical-collection`](http://runspired.github.io/smoke-and-mirrors/#/available-components/vertical-collection) component which can be used to build.

 - [infinite scroll](http://runspired.github.io/smoke-and-mirrors/#/examples/infinite-scroll)
   - even when you need to scroll via [body](http://runspired.github.io/smoke-and-mirrors/#/examples/scrollable-body)
   - with [dynamic item sizes](http://runspired.github.io/smoke-and-mirrors/#/examples/flexible-layout)
   - and even in [pathological rendering](http://runspired.github.io/smoke-and-mirrors/#/examples/dbmon) scenarios.

## Documentation

For updated documentation, announcements, and demos running the latest release please 
visit [http://runspired.github.io/smoke-and-mirrors/](http://runspired.github.io/smoke-and-mirrors/)
