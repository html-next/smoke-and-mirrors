Smoke-and-mirrors
=================

[![npm version](https://badge.fury.io/js/smoke-and-mirrors.svg)](http://badge.fury.io/js/smoke-and-mirrors)
[![Build Status](https://travis-ci.org/runspired/smoke-and-mirrors.svg?branch=master)](https://travis-ci.org/runspired/smoke-and-mirrors)
[![Ember Observer Score](http://emberobserver.com/badges/smoke-and-mirrors.svg)](http://emberobserver.com/addons/smoke-and-mirrors)
[![Circle CI](https://circleci.com/gh/runspired/smoke-and-mirrors/tree/master.svg?style=svg)](https://circleci.com/gh/runspired/smoke-and-mirrors/tree/master)


Sometimes being "ambitious" gets you in trouble.  When it does, `Smoke-and-mirrors` is here
to put out your `Ember` fire.

`Smoke-and-mirrors` is an `ember-cli-addon` that brings performance minded `views`, `mixins`,
and `components` together to help you deliver your ambitions.

**Q: Aren't *Glimmer* and *Fastboot* coming?  Don't they solve all our performance problems?**

**A: No**

Both of these enhancements push Ember into a new, performance rich future.  Sometimes though,
this isn't enough.  This library is here for you when it's not, and honestly, many features
here should only be utilized *when* it's not, and no sooner.

The most common scenarios for needing to heavily optimize your components are applications intended
for heavy long-life mobile use, infinite scrolling, and applications with routes that are entered
and exited very often as part of a UX flow pattern.

#### [Changelog](./CHANGELOG.md)

#### [Roadmap](./ROADMAP.md)

## Core concepts

- View/DOM/attribute Caching
- DOM recycling
- Occlusion culling (cloaking)
- Pre-rendering

    
- [Low hanging fruit: easy optimizations](./docs/optimization.md)
- [Occlusion: what is it?](./docs/occlusion.md)
- [Implementing Infinite Scroll](./docs/infinite-scroll.md)

## Documentation

- [Occlusion Collection](./docs/occlusion-collection.md)
- [Occlusion View](./docs/occlusion-view.md)
- [Magic Array](./docs/magic-array.md)
- [Default CSS](./docs/css.md)

